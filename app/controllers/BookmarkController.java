package controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.common.base.Strings;
import com.saleem.utils.HTTPSUtils;
import com.saleem.utils.HibernateUtil;
import models.Bookmark;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import play.mvc.Controller;
import play.mvc.Http;
import play.mvc.Result;

import javax.persistence.EntityManager;
import java.util.List;


public class BookmarkController extends Controller {

    public Result AddBookmark(Http.Request request) {
        JsonNode node = request.body().asJson();
        String email = HTTPSUtils.GetEmailFromToken(node.get("token").textValue());
        String location = node.get("location").textValue();
        String name = node.get("bookmarkName").textValue();
        String quantity = node.get("quantity").textValue();
        String aspectSet = node.get("aspectSet").textValue();
        String interval = node.get("interval").textValue();
        String startTime = node.get("startTime").textValue();
        String endTime = node.get("endTime").textValue();


        if (!Strings.isNullOrEmpty(email)) {
            SessionFactory sessionFactory = HibernateUtil.getSession();
            Session session = sessionFactory.getCurrentSession();
            EntityManager em = sessionFactory.createEntityManager();
            em.getTransaction().begin();

            Long userId = em.createQuery("select g.id from UserProfile g where email = :email", Long.class)
                    .setParameter("email", email)
                    .getSingleResult();
            if (userId != null) {

                Bookmark bookmark = new Bookmark(userId, name, location, quantity, aspectSet, interval, startTime, endTime);
                session.beginTransaction();
                session.save(bookmark);
                session.getTransaction().commit();
                session.close();
                return ok();
            } else {
                return badRequest("Session is expired");
            }
        } else {
            return badRequest("Session is expired");
        }
    }

    public Result GetBookmarks(String token) {
        String email = HTTPSUtils.GetEmailFromToken(token);

        if (!Strings.isNullOrEmpty(email)) {
            SessionFactory sessionFactory = HibernateUtil.getSession();
            Session session = sessionFactory.getCurrentSession();
            EntityManager em = sessionFactory.createEntityManager();
            session.beginTransaction();
            em.getTransaction().begin();

            Long userId = em.createQuery("select g.id from UserProfile g where email = :email", Long.class)
                    .setParameter("email", email)
                    .getSingleResult();

            List<Bookmark> bookmarks = em.createQuery("select b from Bookmark b left join UserProfile u on b.userprofile_id = :userId where u.id = :userId", Bookmark.class)
                    .setParameter("userId", userId)
                    .getResultList();

            em.close();
            session.close();

            JsonNode node = HTTPSUtils.ConvertToJsonNode(bookmarks);
            if (node != null) {
                return ok(node);
            } else {
                return status(422);
            }

        } else {
            return forbidden("Login session expired, please log in");
        }
    }
}
