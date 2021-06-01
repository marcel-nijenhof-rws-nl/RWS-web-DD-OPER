package controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.google.common.base.Strings;
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

    public Result GetUserInfo(String token) {
        String email = HTTPSUtils.GetEmailFromToken(token);

        SessionFactory sessionFactory = HibernateUtil.getSession();
        EntityManager em = sessionFactory.createEntityManager();
        em.getTransaction().begin();

        UserProfile profile = em.createQuery("select u from UserProfile u where email = :email", UserProfile.class)
                .setParameter("email", email)
                .getSingleResult();

        em.close();

        if (profile != null) {
            ObjectMapper mapper = new ObjectMapper();
            ObjectNode node = mapper.createObjectNode();
            node.put("id", profile.getId());
            node.put("firstName", profile.getFirstname());
            node.put("lastName", profile.getLastname());
            node.put("email", profile.getEmail());
            node.put("password", profile.getPassword());

            return ok(node);
        } else {
            return notFound();
        }

    }

    public Result UpdateUserInfo(Http.Request request) {
        JsonNode node = request.body().asJson();

        Long userId = node.get("id").asLong();
        boolean hasPasswordChanged = false;

        SessionFactory sessionFactory = HibernateUtil.getSession();
        EntityManager em = sessionFactory.createEntityManager();
        em.getTransaction().begin();

        UserProfile profile = em.createQuery("select u from UserProfile u where id = :id", UserProfile.class)
                .setParameter("id", userId)
                .getSingleResult();


        profile.setFirstname(node.get("firstName").textValue());
        profile.setLastname(node.get("lastName").textValue());

        em.createQuery("update UserProfile u set u.firstname = :firstName, u.lastname = :lastName where u.id = :userId")
                .setParameter("userId", userId)
                .setParameter("firstName", node.get("firstName").textValue())
                .setParameter("lastName", node.get("lastName").textValue());


        if (!Strings.isNullOrEmpty(node.get("oldPassword").textValue())
                && !Strings.isNullOrEmpty(node.get("newPassword").textValue())
                && !Strings.isNullOrEmpty(node.get("newPasswordRepeat").textValue())
        ) {
            String oldPasswordHashed = HashPassword(node.get("oldPassword").textValue());

            if (profile.getPassword().equals(oldPasswordHashed)) {
                if (node.get("newPassword").textValue().equals(node.get("newPasswordRepeat").textValue())) {
                    String newHashedPassword = HashPassword(node.get("newPassword").textValue());
                    profile.setPassword(newHashedPassword);
                    hasPasswordChanged = true;

                    em.createQuery("update UserProfile u set u.password = :password where u.id = :userId")
                            .setParameter("userId", userId)
                            .setParameter("password", newHashedPassword);

                } else {
                    return badRequest("De nieuwe wachtwoorden komen niet overeen");
                }
            } else {
                return badRequest("Het oude wachtwoord komt niet overeen");
            }

        }

        em.getTransaction().commit();
        em.close();

        return hasPasswordChanged ? ok("Gegevens opgeslagen") : ok("Gegevens opgeslagen, wachtwoord ongewijzigd");
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


    public Result GetDatabaseURL(String token) {
        String databaseUrl = HTTPSUtils.GetBaseDatabaseURL(token);
        return ok(databaseUrl);
    }

    public Result SetDatabaseURL(Http.Request request) {
        JsonNode node = request.body().asJson();
        String email = HTTPSUtils.GetEmailFromToken(node.get("token").textValue());
        String databaseUrl = node.get("databaseUrl").textValue();


        SessionFactory sessionFactory = HibernateUtil.getSession();
        EntityManager em = sessionFactory.createEntityManager();
        em.getTransaction().begin();

        em.createQuery("update from UserProfile set databaseUrl = :databaseUrl where email = :email")
                .setParameter("databaseUrl", databaseUrl)
                .setParameter("email", email)
                .executeUpdate();

        em.close();


        return ok();
    }

}
