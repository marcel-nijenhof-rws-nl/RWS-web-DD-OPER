#!/bin/sh
set -e -x
cd ./git-src

curl -k -o rws-web-dd-oper-conf.tar.gz -u "${NEXUS_USER}:${NEXUS_PASSWORD}" "${NEXUS_URL}"
tar xvzf rws-web-dd-oper-conf.tar.gz
ls -la conf

chmod 755 ./sbt-dist/bin/sbt

./sbt-dist/bin/sbt dist
mv target/universal/rws-web-dd-oper-1.0-SNAPSHOT.zip ../play-app
jar -tf ../play-app/rws-web-dd-oper-1.0-SNAPSHOT.zip
