#!/bin/sh

echo "execute ./vendor/propel/propel/bin/propel model:build -vv"
php /vendor/propel/propel/bin/propel model:build -vv

echo ""
echo "----------------------"
echo "  Generated classes:"
echo "----------------------"
/usr/bin/tree ./generated-classes/