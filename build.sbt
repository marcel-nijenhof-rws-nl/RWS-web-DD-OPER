name := """RWS-web-DD-OPER"""
organization := "com.example"

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayJava)

scalaVersion := "2.13.4"

libraryDependencies ++= Seq(
  guice,
  evolutions,
  javaJpa,
  javaJdbc,
  "org.postgresql" % "postgresql" % "42.2.5",
  "org.hibernate" % "hibernate-core" % "5.4.9.Final"
)

PlayKeys.externalizeResourcesExcludes += baseDirectory.value / "conf" / "META-INF" / "persistence.xml"
