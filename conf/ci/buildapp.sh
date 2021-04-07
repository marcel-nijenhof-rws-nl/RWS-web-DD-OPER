#!/bin/sh
set -e -x

chmod 755 ./sbt-dist/bin/sbt

./sbt-dist/bin/sbt dist
