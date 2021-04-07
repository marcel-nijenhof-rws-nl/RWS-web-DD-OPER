package controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.saleem.utils.HTTPSUtils;
import com.saleem.utils.HibernateUtil;
import models.UserProfile;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import play.mvc.Controller;
import play.mvc.Http;
import play.mvc.Result;

import javax.persistence.EntityManager;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;

public class LoginController extends Controller {

    public Result Register(Http.Request request) {

        JsonNode node = request.body().asJson();
        String email = node.get("email").textValue();
        String password = node.get("password").textValue();
        String firstname = node.get("firstname").textValue();
        String lastname = node.get("lastname").textValue();

        SessionFactory sessionFactory = HibernateUtil.getSession();
        Session session = sessionFactory.getCurrentSession();
        EntityManager em = sessionFactory.createEntityManager();
        em.getTransaction().begin();

        List<UserProfile> g = em.createQuery("select g from UserProfile g where email = :email", UserProfile.class)
                .setParameter("email", email)
                .getResultList();

        if (g.size() > 0) {
            return badRequest("Email is already in use.");
        } else {
            String hashedPassword = HashPassword(password);
            UserProfile userProfile = new UserProfile(firstname, lastname, email, hashedPassword);
            session.beginTransaction();
            session.save(userProfile);
            session.getTransaction().commit();
            session.close();
            return ok();
        }
    }

    public Result Login(Http.Request request) {
        JsonNode node = request.body().asJson();
        String bodyPassword = node.get("password").textValue();
        String email = node.get("email").textValue();
        String hash = HashPassword(bodyPassword);

        SessionFactory sessionFactory = HibernateUtil.getSession();
        EntityManager em = sessionFactory.createEntityManager();
        em.getTransaction().begin();

        Long count = em.createQuery("select count(u) from UserProfile u where email = :email", Long.class)
                .setParameter("email", email)
                .getSingleResult();

        if (count > 0) {
            String userPassword = em.createQuery("select password from UserProfile g where email = :email", String.class)
                    .setParameter("email", email)
                    .getSingleResult();

            em.close();
            if (userPassword.equals(hash)) {
                return ok();
            } else {
                return status(422); // Input was valid but account does not exist
            }
        } else {
            return status(422);
        }
    }

    public Result validateSession(String token) {
        if (HTTPSUtils.IsSessionValid(token)) return ok();
        else return forbidden();
    }

    public static String HashPassword(String password) {

        String hashedPassword = null;

        try {
            MessageDigest md = MessageDigest.getInstance("SHA-512");
            md.update(password.getBytes(StandardCharsets.UTF_8));
            byte[] bytes = md.digest();

            StringBuilder sb = new StringBuilder();
            for (byte aByte : bytes) {
                sb.append(Integer.toString((aByte & 0xff) + 0x100, 16).substring(1));
            }

            hashedPassword = sb.toString();
        } catch (NoSuchAlgorithmException e) {
            System.out.println("ERROR: " + e);
            e.printStackTrace();
        }
        return hashedPassword;
    }


}
