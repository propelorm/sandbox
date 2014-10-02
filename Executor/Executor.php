<?php

namespace PropelSandbox\Executor;

use PropelSandbox\Model\Fiddle;
use Symfony\Component\Process\ProcessBuilder;

class Executor
{

    /**
     * @var \Predis\Client
     */
    protected $redis;

    /**
     * @var \Doctrine\DBAL\Connection
     */
    protected $db;

    /**
     * @param $redis
     */
    public function __construct(\Predis\Client $redis, $db, $vendorDir)
    {
        $this->redis = $redis;
        $this->db = $db;
        $this->vendorDir = $vendorDir;
    }

    /**
     * Executes the fiddle, stores its output and its data in redis and returns the output.
     *
     * Note: This does not handle any security stuff. This should be handled in the controller.
     *
     * @param Fiddle $fiddle
     *
     * @return array
     */
    public function execute(Fiddle $fiddle)
    {
        if (!$fiddle->getPhp() && !$fiddle->getSchema()) {
            return false;
        }

        $this->prepareChroot($fiddle);

        $this->buildDatabaseSchema($fiddle);
        $this->prepareRuntimeConfig($fiddle);

        $scriptOutput = $this->executeInJail($fiddle);
        $fiddle->setScriptOutput($scriptOutput);
        $this->extractDbInformation($fiddle);
    }

    protected function prepareChroot(Fiddle $fiddle)
    {
        //setup file structure
        $directory = $this->getDirectory($fiddle);
        if (!file_exists($directory)) {
            mkdir($directory . '/home/sandbox', 0700, true);
        }

        $php = $fiddle->getPhp();
        file_put_contents($directory . '/home/sandbox/script.php', <<<EOF
<?php

\$autoloader = require '/vendor/autoload.php';
\$autoloader->add('', __DIR__ . '/generated-classes/');
require './generated-conf/config.php';


$php
EOF
        );
        file_put_contents($directory . '/home/sandbox/schema.xml', $fiddle->getSchema());

        $this->prepareDatabase($fiddle);
    }

    /**
     * Makes sure database is created and ready to use.
     *
     * @param Fiddle $fiddle
     * @return string
     */
    protected function prepareDatabase(Fiddle $fiddle)
    {
        $directory = $this->getDirectory($fiddle);
        $fiddleEscaped = $this->db->quote($fiddle->getId(), \PDO::PARAM_STR);
        $fiddleId = $this->db->quoteIdentifier($fiddle->getId());

        if (file_exists($directory . '/home/sandbox/propel.yml')) {
            return false;
        }

        $dbName = 'fiddle_' . $fiddle->getId();
        $userName = $fiddle->getId();
        $password = substr(md5(microtime() * 10000 + mt_rand()), 0, 14);
        $dbNameIdentifier = $this->db->quoteIdentifier($dbName);

        //create new db credentials
        $row = $this->db->fetchArray("SHOW DATABASES LIKE ?", [$dbName]);
        if (false === $row) {
            // database does not exist yet
            $this->db->executeQuery(sprintf("CREATE DATABASE %s", $dbNameIdentifier));
        }

        $user = $this->db->fetchArray("SELECT User FROM mysql.user WHERE User = ?", [$fiddle->getId()]);
        // we don't save the password in our database so we have to remove the user first
        if ($user) {
            $this->db->executeQuery(sprintf("DROP USER %s@'localhost'", $fiddleEscaped));
        }

        $this->db->executeQuery(
            sprintf(
                "CREATE USER %s@'localhost' IDENTIFIED BY %s",
                $fiddleEscaped,
                $this->db->quote($password, \PDO::PARAM_STR)
            )
        );

        $this->db->executeQuery(
            sprintf(
                "GRANT USAGE, ALTER, CREATE, DELETE, DROP, INDEX, INSERT, SELECT, UPDATE ON %s.* TO %s@'localhost'",
                $dbNameIdentifier,
                $fiddleEscaped
            )
        );


        $propelConfig = <<<EOF
propel:
  database:
      connections:
          default:
              adapter: mysql
              classname: Propel\Runtime\Connection\DebugPDO
              dsn: mysql:host=127.0.0.1;dbname=$dbName
              user: $userName
              password: $password
              attributes:
  runtime:
      defaultConnection: default
      connections:
          - default
  generator:
      defaultConnection: default
      connections:
          - default
EOF;
        file_put_contents($directory . '/home/sandbox/propel.yml', $propelConfig);


        return $propelConfig;
    }

    protected function prepareRuntimeConfig(Fiddle $fiddle)
    {
        $directory = $this->getDirectory($fiddle);

        if (file_exists($directory . '/home/sandbox/generated-conf/')) {
            return;
        }

        $this->executeInJail($fiddle, '/usr/bin/php /vendor/propel/propel/bin/propel config:convert');

    }

    /**
     * Makes sure that schema.xml and mysql database schema are in sync.
     */
    protected function buildDatabaseSchema(Fiddle $fiddle)
    {
        $lastBuiltHash = $fiddle->getLastExecutionSchemaHash();
        $currentHash = $this->getSchemaHash($fiddle);
        $directory = $this->getDirectory($fiddle);

        if ($lastBuiltHash !== $currentHash) {
            $buildOutput = $this->executeInJail($fiddle, '/bin/sql-build.sh');
            $fiddle->setSqlBuildOutput($buildOutput);

            $buildOutput = $this->executeInJail($fiddle, '/bin/model-build.sh');
            $fiddle->setModelBuildOutput($buildOutput);
        }

        if (file_exists($directory . '/home/sandbox/generated-sql/')) {
            $insertOutput = $this->executeInJail(
                $fiddle,
                '/usr/bin/php /vendor/propel/propel/bin/propel sql:insert -vv'
            );
            $fiddle->setSqlInsertOutput($insertOutput);
        } else {
            $fiddle->setSqlInsertOutput('');
        }

        $fiddle->setLastExecutionSchemaHash($currentHash);
    }

    protected function extractDbInformation(Fiddle $fiddle)
    {
        $identifier = $this->db->quoteIdentifier('fiddle_' . $fiddle->getId());
        $result = array();
        $tables = $this->db->fetchAll(sprintf('SHOW TABLES FROM %s', $identifier));

        foreach ($tables as $table) {
            $table = current($table);
            $tableIdentifier = $identifier . '.' . $this->db->quoteIdentifier($table);
            $items = $this->db->fetchAll(sprintf('SELECT * FROM %s LIMIT 1000', $tableIdentifier));
            $result[] = [
                'name' => $table,
                'count' => count($items),
                'columns' => $items ? array_keys($items[0]) : [],
                'items' => $items ?: false
            ];
        }

        $fiddle->setDatabaseInformation($result);
    }

    /**
     * @param Fiddle $fiddle
     * @return string
     */
    protected function getSchemaHash(Fiddle $fiddle)
    {
        $directory = $this->getDirectory($fiddle);
        $file = $directory . '/home/sandbox/schema.xml';
        if (file_exists($file)) {
            return md5_file($directory . '/home/sandbox/schema.xml');
        } else {
            return '';
        }
    }

    /**
     * @param Fiddle $fiddle
     * @return string
     */
    protected function getDirectory(Fiddle $fiddle)
    {
        return '/tmp/propelsandbox/chroots/' . $fiddle->getId();
    }

    /**
     * @param Fiddle $fiddle
     * @param string $command needs absolute path to the binary
     *
     * @return array
     */
    protected function executeInJail(Fiddle $fiddle, $command = '/usr/bin/php script.php')
    {
        $directory = $this->getDirectory($fiddle);
        $builder = new ProcessBuilder();
        // we need sudo access to this file to change its root and change user to 'sandbox'
        $builder->setPrefix('sudo');
        $builder->setArguments(
            [
                __DIR__ . '/../Resources/meta/jail.sh',
                realpath($this->vendorDir),
                $command
            ]
        );
        $process = $builder->getProcess();

        $process->setWorkingDirectory($directory);
        $process->setTimeout(180);
        $timeStart = microtime(true);
        $process->run();

        while ($process->isRunning()) {
            usleep(50 * 1000); //50ms
            // waiting for process to finish
        }

        return [
            'success' => $process->isSuccessful(),
            'output' => $process->getOutput(),
            'error' => $process->getErrorOutput(),
            'time' => microtime(true) - $timeStart
        ];
    }
}