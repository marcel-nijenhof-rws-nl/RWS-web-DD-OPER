package com.saleem.utils;

import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;

public class HibernateUtil {
    private static SessionFactory sessionFactory;

    static {
        try {

            System.out.println("***** ENV VARS *****");
            System.out.println("***** NON JSON *****");
            System.out.println(System.getenv("jdbcUrl"));
            System.out.println(System.getenv("username"));
            System.out.println(System.getenv("password"));

            System.out.println("***** JSON *****");
            System.out.println(System.getenv("system_env_json.VCAP_SERVICES.postgresql[0].credentials.jdbcUrl"));
            System.out.println(System.getenv("system_env_json.VCAP_SERVICES.postgresql[0].credentials.username"));
            System.out.println(System.getenv("system_env_json.VCAP_SERVICES.postgresql[0].credentials.password"));
            System.out.println("********************");

            Configuration cfg = new Configuration();
            cfg.configure("hibernate.cfg.xml");
            cfg.setProperty("hibernate.connection.url", System.getenv("jdbcUrl"));
            cfg.setProperty("hibernate.connection.username", System.getenv("username"));
            cfg.setProperty("hibernate.connection.password", System.getenv("password"));
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
