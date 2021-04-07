package com.saleem.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.hibernate.SessionFactory;

import javax.inject.Singleton;
import javax.net.ssl.*;
import javax.persistence.EntityManager;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.InputStream;
import java.net.URL;
import java.security.KeyStore;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;
import java.util.Properties;

public class HTTPSUtils {

    @Singleton
    final static Properties properties = new Properties();
    final static String currentPath = System.getProperty("user.dir");

    public static void InitializeProperties() {
        if (properties.size() == 0) {
            try {
                properties.load(new FileReader(currentPath + "/conf/certification.properties"));
            } catch (Exception e) {
                System.out.println("Something went wrong when trying to initialize the .properties file");
                e.printStackTrace();
            }
        }
    }

    public static JsonNode RequestJSON(String urlString) {
        InitializeProperties();
        try {
            String password = properties.getProperty("password");
            String cacertPath = System.getenv("JAVA_HOME") + properties.getProperty("cacertPath");
            String cacertPass = properties.getProperty("cacertPass");

            KeyStore clientStore = KeyStore.getInstance("JKS");
            clientStore.load(new FileInputStream(currentPath + "/conf/certificate.jks"), password.toCharArray());
            KeyManagerFactory kmf = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
            kmf.init(clientStore, password.toCharArray());
            KeyManager[] kms = kmf.getKeyManagers();

            KeyStore trustStore = KeyStore.getInstance("JKS");
            trustStore.load(new FileInputStream(cacertPath), cacertPass.toCharArray());

            TrustManagerFactory tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
            tmf.init(trustStore);
            TrustManager[] tms = tmf.getTrustManagers();

            final SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(kms, tms, new SecureRandom());
            SSLContext.setDefault(sslContext);

            HttpsURLConnection.setDefaultSSLSocketFactory(sslContext.getSocketFactory());

            URL url = new URL(urlString);
            HttpsURLConnection con = (HttpsURLConnection) url.openConnection();

            con.setRequestMethod("GET");
            con.setRequestProperty("Content-Type", "application/json");

            con.connect();

            InputStream is = con.getInputStream();
            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(is);

            con.disconnect();

            is.close();
            return node;

        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public static Boolean IsSessionValid(String token) {

        if (!token.contains(".")) return false;
        String email = null;
        String[] parts = token.split("\\.");
        String payload = parts[1];

        Base64.Decoder decoder = java.util.Base64.getUrlDecoder();

        JsonNode node = ConvertToJsonNode(new String(decoder.decode(payload)));
        if (node != null) {
            email = node.get("email").textValue();

            SessionFactory sessionFactory = HibernateUtil.getSession();
            EntityManager em = sessionFactory.createEntityManager();
            em.getTransaction().begin();

            Long count = em.createQuery("select count(u) from UserProfile u where email = :email", Long.class)
                    .setParameter("email", email)
                    .getSingleResult();

            em.getTransaction().commit();
            em.close();
            return count > 0;
        } else {
            return false;
        }

    }

    public static String GetEmailFromToken(String token) {
        if (!token.contains(".")) {
            return null;
        }

        String[] parts = token.split("\\.");
        String payload = parts[1];

        Base64.Decoder decoder = java.util.Base64.getUrlDecoder();

        JsonNode node = ConvertToJsonNode(new String(decoder.decode(payload)));
        if (node != null) {
            return node.get("email").textValue();
        } else {
            return null;
        }
    }

    public static JsonNode ConvertToJsonNode(List<?> list) {
        ObjectMapper mapper = new ObjectMapper();
        try {
            String jsonString = mapper.writeValueAsString(list);
            return mapper.readTree(jsonString);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        return null;
    }

    public static JsonNode ConvertToJsonNode(String jsonString) {
        ObjectMapper mapper = new ObjectMapper();
        try {
            return mapper.readTree(jsonString);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        return null;
    }
}
