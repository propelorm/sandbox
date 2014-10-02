#!/bin/bash
# requires root privileges

cwd=`pwd`
BASE="/tmp/propelsandbox/base/"
metaDir=`dirname $0`

if [ ! -d $BASE ]; then
    $metaDir/setup_jail_base.sh
fi

BIND="mount --bind -o nosuid"
#if hash bindfs 2>/dev/null; then #osx
#    BIND="bindfs"
#fi

if [ ! -d $cwd/vendor ]; then
    echo "creating $1 -> $cwd/vendor"
    mkdir -p $cwd/vendor
    chmod 500 $cwd/$file
    $BIND $1 $cwd/vendor
fi

#mount environment stuff
files=( "vendor" "lib" "lib64" "bin" "usr" "etc" "dev" ) # "proc" "sys"
for file in "${files[@]}"
do
    if [ ! -d $cwd/$file ]; then
        mkdir -p $cwd/$file
        chmod 500 $cwd/$file
        $BIND $BASE/$file $cwd/$file
    fi
done

mkdir -p $cwd/home/sandbox

fixfolder=( "/tmp/propelsandbox/" "/tmp/propelsandbox/chroots/" "$cwd" "$cwd/home" "$cwd/home/sandbox" )
for file in "${fixfolder[@]}"
do
    chown sandbox:www-data $file
    chmod 770 $file
done

#echo "entering jail $cwd: $2";
su sandbox -c "userchroot $cwd /home/sandbox $2"
