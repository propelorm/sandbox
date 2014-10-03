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


examples.archivable = {
    label: 'Archivable Behavior',
    php: `$book = new Book();
$book->setTitle('War And Peace');
$book->save();

// delete and archive the book
$book->delete();
var_dump(BookQuery::create()->count());

// find the archived book
$archivedBook = BookArchiveQuery::create()->findPk($book->getId());
var_dump($archivedBook->getTitle());
var_dump($archivedBook->getArchivedAt());

`,
    schema: `<database name="default">
  <table name="book">
    <column name="id" required="true" primaryKey="true" autoIncrement="true" type="integer" />
    <column name="title" type="varchar" required="true" primaryString="true" />
    <behavior name="archivable" />
  </table>
</database>`
};

examples.auto_add_pk = {
    label: 'AutoAddPk Behavior',
    php: `$b = new Book();
$b->setTitle('War And Peace');
$b->save();
echo $b->getId(); // 1

`,
    schema: `<database name="default">
  <table name="book">
    <column name="title" type="varchar" required="true" primaryString="true" />
    <behavior name="auto_add_pk" />
  </table>
</database>`
};

examples.delegate = {
    label: 'Delegate Behavior',
    php: `$account = new Account();
$account->setLogin('francois');
$account->setPassword('Secr3t');

// Fill the profile via delegation
$account->setEmail('francois@example.com');
$account->setTelephone('202-555-9355');
// same as
$profile = new Profile();
$profile->setEmail('francois@example.com');
$profile->setTelephone('202-555-9355');
$account->setProfile($profile);

// save the account and its profile
$account->save();

// retrieve delegated data directly from the main object
echo $account->getEmail(); // francois@example.com
`,
    schema: `<database name="default">
  <table name="account">
    <column name="id" required="true" primaryKey="true" autoIncrement="true" type="integer" />
    <column name="login" type="varchar" required="true" />
    <column name="password" type="varchar" required="true" />
    <behavior name="delegate">
      <parameter name="to" value="profile" />
    </behavior>
  </table>
  <table name="profile">
    <column name="email" type="varchar" />
    <column name="telephone" type="varchar" />
  </table>
</database>`
};


examples.i18n = {
    label: 'I18n Behavior',
    php: `$item = new Item();
$item->setPrice('12.99');

// add an English translation
$item->setLocale('en_US');
$item->setName('Microwave oven');

// add a French translation
$item->setLocale('fr_FR');
$item->setName('Four micro-ondes');

// save the item and its translations
$item->save();

// retrieve text and non-text translations directly from the main object
var_dump($item->getPrice()); // 12.99

$item->setLocale('en_US');
var_dump($item->getName()); // Microwave oven

$item->setLocale('fr_FR');
var_dump($item->getName()); // Four micro-ondes

`,
    schema: `<database name="default">
  <table name="item">
    <column name="id" required="true" primaryKey="true" autoIncrement="true" type="integer" />
    <column name="name" type="varchar" required="true" />
    <column name="description" type="longvarchar" />
    <column name="price" type="float" />
    <column name="is_in_store" type="boolean" />
    <behavior name="i18n">
      <parameter name="i18n_columns" value="name, description" />
    </behavior>
  </table>
</database>`
};


examples.nested_set = {
    label: 'NestedSet Behavior',
    php: `$s1 = new Section();
$s1->setTitle('Home');
$s1->makeRoot(); // make this node the root of the tree
$s1->save();
$s2 = new Section();
$s2->setTitle('World');
$s2->insertAsFirstChildOf($s1); // insert the node in the tree
$s2->save();
$s3 = new Section();
$s3->setTitle('Europe');
$s3->insertAsFirstChildOf($s2); // insert the node in the tree
$s3->save();
$s4 = new Section();
$s4->setTitle('Business');
$s4->insertAsNextSiblingOf($s2); // insert the node in the tree
$s4->save();

// see the tables section bottom left.
`,
    schema: `<database name="default">
  <table name="section">
    <column name="id" required="true" primaryKey="true" autoIncrement="true" type="integer" />
    <column name="title" type="varchar" required="true" primaryString="true" />
    <behavior name="nested_set" />
  </table>
</database>`
};



examples.sluggable = {
    label: 'Sluggable Behavior',
    php: `$p1 = new Post();
$p1->setTitle('Hello, World!');
$p1->save();
echo $p1->getSlug();

// see the tables section bottom left.
`,
    schema: `<database name="default">
  <table name="post">
    <column name="id" required="true" primaryKey="true" autoIncrement="true" type="integer" />
    <column name="title" type="varchar" required="true" primaryString="true" />
    <behavior name="sluggable" />
  </table>
</database>`
};



examples.sortable = {
    label: 'Sortable Behavior',
    php: `$t1 = new Task();
$t1->setTitle('Wash the dishes');
$t1->save();
var_dump($t1->getRank());

$t2 = new Task();
$t2->setTitle('Do the laundry');
$t2->save();
var_dump($t2->getRank());

$t3 = new Task();
$t3->setTitle('Rest a little');
$t3->save();
var_dump($t3->getRank());

$t3->moveUp();
var_dump($t3->getRank());
`,
    schema: `<database name="default">
  <table name="task">
    <column name="id" required="true" primaryKey="true" autoIncrement="true" type="integer" />
    <column name="title" type="varchar" required="true" primaryString="true" />
    <behavior name="sortable" />
  </table>
</database>`
};


examples.Inheritance = {
    label: 'Inheritance',
    php: `$basketballer = new Basketballer();
$basketballer->setPoints(101);
$basketballer->setFieldGoals(47);
$basketballer->setThreePointsFieldGoals(7);

// set player identity via delegation
$basketballer->setFirstName('Michael');
$basketballer->setLastName('Giordano');

// save basketballer and player
$basketballer->save();

// retrieve delegated data directly from the main object
echo $basketballer->getFirstName(); // Michael
`,
    schema: `<database name="default">
  <table name="player">
    <column name="id" type="integer" primaryKey="true" autoIncrement="true"/>
    <column name="first_name" type="varchar" size="100"/>
    <column name="last_name" type="varchar" size="100"/>
  </table>
  <table name="footballer">
    <column name="id" required="true" primaryKey="true" autoIncrement="true" type="integer" />
    <column name="goals_scored" type="integer" />
    <column name="fouls_committed" type="integer" />
    <column name="player_id" type="integer" />
    <foreign-key foreignTable="player">
      <reference local="player_id" foreign="id" />
    </foreign-key>
    <behavior name="delegate">
      <parameter name="to" value="player" />
    </behavior>
  </table>
  <table name="basketballer">
    <column name="id" required="true" primaryKey="true" autoIncrement="true" type="integer" />
    <column name="points" type="integer" />
    <column name="field_goals" type="integer" />
    <column name="three_points_field_goals" type="integer" />
    <column name="player_id" type="integer" />
    <foreign-key foreignTable="player">
      <reference local="player_id" foreign="id" />
    </foreign-key>
    <behavior name="delegate">
      <parameter name="to" value="player" />
    </behavior>
  </table>
</database>`
};




export default examples;