#!/bin/sh

echo "execute ./vendor/propel/propel/bin/propel config:convert -vv"
php /vendor/propel/propel/bin/propel config:convert -vv

tree ./generated-conf/

echo cat ./generated-conf/config.php:
cat ./generated-conf/config.php