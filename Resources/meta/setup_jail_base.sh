#!/bin/bash
function mkchroot
{
  [ $# -lt 2 ] && return

  dest=$1
  shift
  for i in "$@"
  do
    # Get an absolute path for the file
    [ "${i:0:1}" == "/" ] || i=$(which $i)
    # Skip files that already exist at target.
    [ -f "$dest/$i" ] && continue
    if [ -e "$i" ]
    then
      # Create destination path
      d=`echo "$i" | grep -o '.*/'` &&
      mkdir -p "$dest/$d" &&
      # Copy file
      cat "$i" > "$dest/$i" &&
      chmod +x "$dest/$i"
    else
      echo "Not found: $i"
    fi
    # Recursively copy shared libraries' shared libraries.
    mkchroot "$dest" $(ldd "$i" | egrep -o '/.* ')
  done
}


BASE="/tmp/propelsandbox/base/"

if [ -d $BASE ]; then
#    umount $BASE/proc
#    umount $BASE/sys
#    umount $BASE/dev/pts/*
#    umount $BASE/dev
    rm $BASE/dev/*

    rm -r $BASE/bin/*
    rm -r $BASE/etc/*
    rm -r $BASE/lib/*
    rm -r $BASE/lib64/*
    rm -r $BASE/usr/*
fi

mkdir -p $BASE
mkdir -p $BASE/etc

mkdir -p $BASE/etc/pam.d
cp /etc/pam.d/* $BASE/etc/pam.d/
cp /etc/login.defs $BASE/etc/login.defs

mkdir -p $BASE/etc/security/
cp /etc/security/pam_env.conf $BASE/etc/security/pam_env.conf

mkchroot $BASE /bin/bash /bin/ls /bin/grep /bin/sh /bin/cat /usr/bin/ldd /usr/bin/id /usr/bin/whoami /bin/su /usr/bin/strace /usr/bin/passwd /usr/bin/php /usr/bin/tree
metaDir=`dirname $0`

mkdir -p $BASE/usr/lib/php5/20121212
cp /usr/lib/php5/20121212/xdebug.so $BASE/usr/lib/php5/20121212/
cp /usr/lib/php5/20121212/pdo.so $BASE/usr/lib/php5/20121212/
cp /usr/lib/php5/20121212/pdo_mysql.so $BASE/usr/lib/php5/20121212/
cp /usr/lib/php5/20121212/json.so $BASE/usr/lib/php5/20121212/

mkdir -p /usr/lib/x86_64-linux-gnu
cp /usr/lib/x86_64-linux-gnu/libmysqlclient* $BASE/usr/lib/x86_64-linux-gnu/
cp /lib/x86_64-linux-gnu/libgcc* $BASE/lib/x86_64-linux-gnu/

cp $metaDir/passwd $BASE/etc/passwd
cp $metaDir/shadow $BASE/etc/shadow
cp $metaDir/group $BASE/etc/group
chmod 644 $BASE/etc/passwd $BASE/etc/shadow $BASE/etc/group

mkdir -p $BASE/etc/php5/cli
cp $metaDir/jail-php.ini $BASE/etc/php5/cli/php.ini

mkdir -p $BASE/usr/share/
cp -r /usr/share/zoneinfo $BASE/usr/share/

cp $metaDir/start.sh $BASE/bin/
cp $metaDir/model-build.sh $BASE/bin/
cp $metaDir/sql-build.sh $BASE/bin/
cp $metaDir/sql-insert.sh $BASE/bin/
cp $metaDir/build-config.sh $BASE/bin/


mkdir -p $BASE/dev
# Devices
cd $BASE/dev
# We need as many tty's as consoles
/bin/mknod -m 644 tty1 c 4 1
/bin/mknod -m 644 tty2 c 4 2
/bin/mknod -m 644 tty3 c 4 3
/bin/mknod -m 644 tty4 c 4 4
/bin/mknod -m 644 tty5 c 4 5
/bin/mknod -m 644 tty6 c 4 6
# Some special nodes, just for fun
/bin/mknod -m 444 urandom c 1 9
/bin/mknod -m 666 zero c 1 5
/bin/mknod -m 666 null c 1 3

#mkdir -p $BASE/proc
#mkdir -p $BASE/sys
#mount -t proc proc $BASE/proc/
#mount -t sysfs sys $BASE/sys/
#mount -o bind /dev $BASE/dev/
