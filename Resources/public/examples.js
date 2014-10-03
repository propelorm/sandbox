var examples = {};


examples.bookstore = {
    label: 'Simple Bookstore',
    php: `$book = new Book();
$book->setTitle('My Heros');
$book->setIsbn('123154');

$author = new Author();
$author->setFirstName('Hans');
$author->setLastName('Zimmer');

$book->setAuthor($author);
$book->save();

var_dump($book->toArray());`,
    schema: `<database name="default">
  <table name="book">
    <column name="id" type="integer" required="true" primaryKey="true" autoIncrement="true"/>
    <column name="title" type="varchar" size="255" required="true" />
    <column name="isbn" type="varchar" size="24" required="true" phpName="ISBN"/>
    <column name="author_id" type="integer" required="true"/>
    <foreign-key foreignTable="author">
      <reference local="author_id" foreign="id"/>
    </foreign-key>
  </table>
  <table name="author">
    <column name="id" type="integer" required="true" primaryKey="true" autoIncrement="true"/>
    <column name="first_name" type="varchar" size="128" required="true"/>
    <column name="last_name" type="varchar" size="128" required="true"/>
  </table>
</database>`
};

examples.timestample = {
    label: 'Timestample Behavior',
    php: `$book = new Book();
$book->setTitle('Fancy Title');
$book->save();

echo sprintf("created at %s\\n", $book->getCreatedAt()->format('c'));
echo sprintf("created at %s\\n", $book->getUpdatedAt()->format('c'));

sleep(1);
$book->setTitle('Another title');
$book->save();

echo "---\\n";

echo sprintf("created at %s\\n", $book->getCreatedAt()->format('c'));
echo sprintf("created at %s\\n", $book->getUpdatedAt()->format('c'));`,
    schema: `<database name="default">
  <table name="book">
    <column name="id" type="integer" required="true" primaryKey="true" autoIncrement="true"/>
    <column name="title" type="varchar" size="255" required="true" />
    <behavior name="timestampable" />
  </table>
</database>`
};

examples.versionable = {
    label: 'Versionable Behavior',
    php: `$book = new Book();

// automatic version increment
$book->setTitle('War and Peas');
$book->save();
var_dump($book->getVersion()); // 1
$book->setTitle('War and Peace');
$book->save();
var_dump($book->getVersion()); // 2

// reverting to a previous version
$book->toVersion(1);
echo $book->getTitle(); // 'War and Peas'
// saving a previous version creates a new one
$book->save();
var_dump($book->getVersion());  // 3

// checking differences between versions
print_r($book->compareVersions(1, 2));
`,
    schema: `<database name="default">
  <table name="book">
    <column name="id" required="true" primaryKey="true" autoIncrement="true" type="integer" />
    <column name="title" type="varchar" required="true" />
    <behavior name="versionable" />
  </table>
</database>`
};



export default examples;