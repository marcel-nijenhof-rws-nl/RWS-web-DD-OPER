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
            Configuration cfg = new Configuration();
            JsonNode envNode = mapper.readTree(System.getenv("VCAP_SERVICES"));

            String connectionUrl = envNode.get("postgresql").get(0).get("credentials").get("jdbcUrl").textValue();
            String username = envNode.get("postgresql").get(0).get("credentials").get("username").textValue();
            String password = envNode.get("postgresql").get(0).get("credentials").get("password").textValue();

            cfg.configure("hibernate.cfg.xml");
            cfg.setProperty("hibernate.connection.url", connectionUrl);
            cfg.setProperty("hibernate.connection.username", username);
            cfg.setProperty("hibernate.connection.password", password);

            sessionFactory = cfg.buildSessionFactory();

        } catch (Throwable ex) {
            System.err.println("Could not load from VCAP_SERVICES, trying localhost...");
            try {
                Configuration cfg = new Configuration();

                cfg.configure("hibernate.cfg.xml");
                cfg.setProperty("hibernate.connection.url", "jdbc:postgresql://localhost:5432/postgres");
                cfg.setProperty("hibernate.connection.username", "postgres");
                cfg.setProperty("hibernate.connection.password", "password");
                sessionFactory = cfg.buildSessionFactory();

            } catch (Throwable exc) {
                System.err.println("Could not load System Env Vars from localhost");
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
