#!/bin/sh
set -e -x
cd ./git-src
chmod 755 ./sbt-dist/bin/sbt

./sbt-dist/bin/sbt dist
mv target/universal/rws-web-dd-oper-1.0-SNAPSHOT.zip ../play-app
