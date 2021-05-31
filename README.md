# Rijkswaterstaat DD-OPER API

This project is made for Rijkswaterstaat as a reference implementation of the [DD-OPER API](https://digitaledeltaorg.github.io/dd-oper.v201.html).

# Installation

To follow the steps in this tutorial, you will need the correct version of Java and a build tool. You can build Play
projects with any Java build tool. Since sbt takes advantage of Play features such as auto-reload, the tutorial
describes how to build the project with sbt.

Prerequisites include:

* Java Software Developer's Kit (SE) 1.8 or higher
* sbt 0.13.15 or higher (we recommend 1.2.3)
* Node.js
* Files:
    * _application.conf_
    * _certificate.jks_
    * _certification.properties_
    * _hibernate.cfg.xml_

To check your Java version, enter the following in a command window:

`java -version`

To check your sbt version, enter the following in a command window:

`sbt sbtVersion`

To check your Node.js version, specified under 'node', enter the following in a command window:

`npm version`

If you do not have the required versions, follow these links to obtain them:

* [Java SE](http://www.oracle.com/technetwork/java/javase/downloads/index.html)
* [sbt](http://www.scala-sbt.org/download.html)
* [Node.js](https://nodejs.org/en/)

## Required configuration files

Before you can start up the application you need to create four additional files for the application to work.

Put these files under `[project-root]/conf`

### application.conf

```
# This is the main configuration file for the application.
# This is an example file

play.http.secret.key="MySecretKey"
play.filters.hosts {
    allowed = ["."]
}

db.default.driver=Database.Driver
db.default.url="url" 
db.default.username="username"
db.default.password="password"

jpa.default=defaultPersistenceUnit
play.evolutions.autoApply=true

play.filters {
  # Disabled filters remove elements from the enabled list.
  disabled += play.filters.csrf.CSRFFilter
}
```

### certificate.jks

Make sure you got a certificate with a private key from your company. In this example we have an `example.pfx`
certificate.

To convert your certificate to a .jks file you need to use a keytool. 

NOTE: Make sure you are in the correct directory of your .pfx file.

Example with keytool from Java:<br>
`keytool -importkeystore -srckeystore example.pfx -srcstoretype pkcs12 -destkeystore certificate.jks -deststoretype JKS`

Your console will prompt you to enter a password. You need to enter the same password of the `example.pfx` certificate. Then set the password of the certificate in the `certification.properties` file under the property `password`

### certification.properties

```
# Certificate password
password=super-secret-password

# CACERT - Path after JAVA_HOME
cacertPath=/path/to/cacert/file
cacertPass=cacert-password
```

### hibernate.cfg.xml

```xml
<?xml version='1.0' encoding='utf-8'?>
<!DOCTYPE hibernate-configuration PUBLIC
        "-//Hibernate/Hibernate Configuration DTD//EN"
        "http://www.hibernate.org/dtd/hibernate-configuration-3.0.dtd">
<hibernate-configuration>
    <session-factory>
      
        <!-- Change these 3 lines to your needs -->
        <property name="connection.username">username</property>
        <property name="connection.password">password</property>
        <property name="connection.url">connection-url</property>
              
        <!-- Change driver settings and Hibernate dialect if you need to -->
        <property name="connection.driver_class">org.postgresql.Driver</property>
        <property name="dialect">org.hibernate.dialect.PostgreSQL82Dialect</property>
      
        <property name="hibernate.current_session_context_class">thread</property>
      
        <!-- Mapping for each model -->
        <mapping class="models.Authors"/>
        <mapping class="models.Books"/>
    </session-factory>
</hibernate-configuration>
```

### Node.js

The project already has a `package.lock` file. To install the modules, open a command window and enter 
```
npm install
```
in the project directory.


## Build and run the project

To build and run the project:

1. Use a command window to change into the project directory, for example: `cd RWS-web-DD-OPER`

2. Build the project. Enter: `sbt run`. The project builds and starts the embedded HTTP server. Since this downloads
   libraries and dependencies, the amount of time required depends partly on your connection's speed.

3. After the message `Server started, ...` displays, enter the following URL in a browser: <http://localhost:9000>

To build a distributable version of the project:
1. Enter `sbt dist`


## Use a debugger

To use a debugger within the project and your IDE:
1. Use a command window to change into the project directory, for example: `cd RWS-web-DD-OPER`

2. Enter `sbt -jvm-debug 9001 run`, this will start building the project, run it and open a socket on port `9001`.

3. After the message `Server started, ...` displays, enter the following URL in a browser: <http://localhost:9000>

4. Configure your debugger to listen to port `9001`

5. You can now set breakpoints within the code.


# Used modules and libraries

* [Play Framework](https://www.playframework.com/)
* [Chart.js](https://www.chartjs.org/)
* [Hibernate](https://hibernate.org/)
* [React](https://reactjs.org/)
* [JSON Web Tokens](https://jwt.io/)
* [node-jws](https://www.npmjs.com/package/jws)
* [browserify](http://browserify.org/)
* [babelify](https://github.com/babel/babelify)
