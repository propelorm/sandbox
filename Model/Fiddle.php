<?php

namespace PropelSandbox\Model;

use Propel\Runtime\Map\TableMap;
use PropelSandbox\Model\Base\Fiddle as BaseFiddle;

/**
 * Skeleton subclass for representing a row from the 'fiddle' table.
 *
 *
 *
 * You should add additional methods to this class to meet the
 * application requirements.  This class will only be generated as
 * long as it does not already exist in the output directory.
 *
 */
class Fiddle extends BaseFiddle
{
    protected function stringToArray($v)
    {
        if ($v && is_string($v)) {
            return json_decode($v, true);
        }

        return [];
    }

    protected function arrayToString($v)
    {
        if (is_array($v)) {
            return json_encode($v);
        }

        return $v;
    }

    /**
     * Export only fields for angular
     */
    public function exportModel()
    {
        $blacklist = ['owner', 'sessionOwner'];
        $array = $this->toArray(TableMap::TYPE_CAMELNAME);
        foreach ($blacklist as $field) {
            unset ($array[$field]);
        }

        return $array;
    }

    public function getScriptOutput()
    {
        return $this->stringToArray(parent::getScriptOutput());
    }

    public function getSqlBuildOutput()
    {
        return $this->stringToArray(parent::getSqlBuildOutput());
    }

    public function getSqlInsertOutput()
    {
        return $this->stringToArray(parent::getSqlInsertOutput());
    }

    public function getModelBuildOutput()
    {
        return $this->stringToArray(parent::getModelBuildOutput());
    }

    public function getSchemaMigrationOutput()
    {
        return $this->stringToArray(parent::getSchemaMigrationOutput());
    }

    public function setScriptOutput($v)
    {
        return parent::setScriptOutput($this->arrayToString($v));
    }

    public function setSqlBuildOutput($v)
    {
        return parent::setSqlBuildOutput($this->arrayToString($v));
    }

    public function setSqlInsertOutput($v)
    {
        return parent::setSqlInsertOutput($this->arrayToString($v));
    }

    public function setModelBuildOutput($v)
    {
        return parent::setModelBuildOutput($this->arrayToString($v));
    }

    public function setSchemaMigrationOutput($v)
    {
        return parent::setSchemaMigrationOutput($this->arrayToString($v));
    }

    public function getDatabaseInformation()
    {
        return $this->stringToArray(parent::getDatabaseInformation());
    }

    public function setDatabaseInformation($v)
    {
        return parent::setDatabaseInformation($this->arrayToString($v));
    }


}
