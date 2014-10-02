#!/bin/sh

echo "execute ./vendor/propel/propel/bin/propel sql:build -vv"
php /vendor/propel/propel/bin/propel sql:build -vv

tree ./generated-sql/

echo ""
echo "----------------------"
echo "  Generated SQL:"
echo "----------------------"
cat ./generated-sql/*.sql