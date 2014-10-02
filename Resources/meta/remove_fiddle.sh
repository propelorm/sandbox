#!/bin/bash


if [ "$(id -u)" != "0" ]; then
   echo "This script must be run as root" 1>&2
   exit 1
fi

if [ "$1" == "" ] || [ "$1" == "/" ]; then
    echo "Its not a good idea to call this script without arguments or /." 1>&2
    exit 1
fi

DIR='/tmp/propelsandbox/chroots/';

TARGET=$DIR/$1;

if [ ! -d $TARGET ]; then
    echo "$TARGET not found." 1>&2
fi

echo "Removing '$TARGET' ..."

umount $TARGET/*
rm -r $TARGET