package com.saleem.utils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;

public class HibernateUtil {
    private static SessionFactory sessionFactory;

    static {
        try {

            ObjectMapper mapper = new ObjectMapper();
            JsonNode envNode = mapper.readTree(System.getenv("VCAP_SERVICES"));

            System.out.println("***** ENV VARS *****");
            System.out.println(System.getenv("VCAP_SERVICES"));
            System.out.println(envNode.get("postgresql").get(0).get("credentials").get("jdbcUrl").textValue());
            System.out.println(envNode.get("postgresql").get(0).get("credentials").get("username").textValue());
            System.out.println(envNode.get("postgresql").get(0).get("credentials").get("password").textValue());
            System.out.println("********************");

            Configuration cfg = new Configuration();
            cfg.configure("hibernate.cfg.xml");
            cfg.setProperty("hibernate.connection.url", envNode.get("postgresql").get(0).get("credentials").get("jdbcUrl").textValue());
            cfg.setProperty("hibernate.connection.username", envNode.get("postgresql").get(0).get("credentials").get("username").textValue());
            cfg.setProperty("hibernate.connection.password", envNode.get("postgresql").get(0).get("credentials").get("password").textValue());
            sessionFactory = cfg.buildSessionFactory();

        } catch (Throwable ex) {
            System.err.println("Could not load from System Env Vars, trying localhost...");
            try {
                Configuration cfg = new Configuration();

                cfg.configure("hibernate.cfg.xml");
                cfg.setProperty("hibernate.connection.url", "jdbc:postgresql://localhost:5432/postgres");
                cfg.setProperty("hibernate.connection.username", "postgres");
                cfg.setProperty("hibernate.connection.password", "password");
                sessionFactory = cfg.buildSessionFactory();

            } catch (Throwable exc) {
                System.err.println("Could not load from System Env Vars from localhost");
                System.err.println("Exception stack Trace ************** begin");
                System.err.println("Hibernate : Initial SessionFactory creation failed." + exc);
                exc.printStackTrace();
                System.err.println("Exception Stack Trace ********* END");
                throw new ExceptionInInitializerError(exc);
            }


        }
    }

    public static SessionFactory getSession() {
        return sessionFactory;
    }
}
