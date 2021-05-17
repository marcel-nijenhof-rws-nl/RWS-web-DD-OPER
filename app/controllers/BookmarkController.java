package controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.common.base.Strings;
import com.saleem.utils.HTTPSUtils;
import com.saleem.utils.HibernateUtil;
import models.Bookmark;
import models.BookmarkGroup;
import models.UserProfile;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import play.mvc.Controller;
import play.mvc.Http;
import play.mvc.Result;

import javax.persistence.EntityManager;
import java.util.ArrayList;
import java.util.List;


public class BookmarkController extends Controller {

    public Result AddBookmark(Http.Request request) {
        JsonNode node = request.body().asJson();

        if (node == null) {
            return status(422);
        }

        String email = HTTPSUtils.GetEmailFromToken(node.get(0).get("token").textValue());
        Long userId = null;
        Long bookmarkGroupId = null;
        String bookmarkName;


        if (!Strings.isNullOrEmpty(email)) {
            SessionFactory sessionFactory = HibernateUtil.getSession();
            Session session = sessionFactory.getCurrentSession();
            EntityManager em = sessionFactory.createEntityManager();
            userId = em.createQuery("select g.id from UserProfile g where email = :email", Long.class)
                    .setParameter("email", email)
                    .getSingleResult();
            session.close();
            em.close();
        }

        for (int i = 0; i < node.size(); i++) {
            if (i == 0) {
                bookmarkName = node.get(i).get("bookmarkName").textValue();
                if (!Strings.isNullOrEmpty(bookmarkName)) {
                    SessionFactory sessionFactory = HibernateUtil.getSession();
                    Session session = sessionFactory.getCurrentSession();
                    EntityManager em = sessionFactory.createEntityManager();

                    BookmarkGroup bookmarkGroup = new BookmarkGroup(userId, bookmarkName);
                    em.getTransaction().begin();
                    session.beginTransaction();
                    session.save(bookmarkGroup);
                    session.getTransaction().commit();

                    bookmarkGroupId = em.createQuery("select b.id from BookmarkGroup b where b.userprofile_id = :userId order by b.id desc", Long.class)
                            .setParameter("userId", userId)
                            .setMaxResults(1)
                            .getSingleResult();

                    session.close();
                    em.close();
                } else {
                    return status(422, "No bookmark name was provided");
                }
            }
            if (node.get(i).size() > 0) {
                String location = node.get(i).get("location").textValue();
                String quantity = node.get(i).get("quantity").textValue();
                String aspectSet = node.get(i).get("aspectSet").textValue();
                String interval = node.get(i).get("interval").textValue();

                if (userId != null) {
                    SessionFactory sessionFactory = HibernateUtil.getSession();
                    Session session = sessionFactory.getCurrentSession();
                    EntityManager em = sessionFactory.createEntityManager();

                    Bookmark bookmark = new Bookmark(bookmarkGroupId, location, quantity, aspectSet, interval);
                    session.beginTransaction();
                    session.save(bookmark);
                    session.getTransaction().commit();
                    em.close();
                    session.close();
                } else {
                    return badRequest("Session is expired");
                }
            }
        }

        return ok();
    }

    public Result GetBookmarks(String token) {
        String email = HTTPSUtils.GetEmailFromToken(token);

        if (!Strings.isNullOrEmpty(email)) {
            SessionFactory sessionFactory = HibernateUtil.getSession();
            Session session = sessionFactory.getCurrentSession();
            EntityManager em = sessionFactory.createEntityManager();
            session.beginTransaction();
            em.getTransaction().begin();

            UserProfile userProfile = em.createQuery("select g from UserProfile g where email = :email", UserProfile.class)
                    .setParameter("email", email)
                    .getSingleResult();

            List<BookmarkGroup> bookmarkGroups = em.createQuery("select b from BookmarkGroup b where b.userprofile_id = :userId", BookmarkGroup.class)
                    .setParameter("userId", userProfile.getId())
                    .getResultList();

            List<List> bookmarksList = new ArrayList<>();
            for (BookmarkGroup groupItem : bookmarkGroups) {
                List bookmarks = em.createQuery("from Bookmark b left join BookmarkGroup bg on b.bookmarkGroup_id = bg.id where bg.userprofile_id = :userId and bg.id = :groupId")
                        .setParameter("userId", userProfile.getId())
                        .setParameter("groupId", groupItem.getId())
                        .getResultList();

                if (!bookmarks.isEmpty()) {
                    bookmarksList.add(bookmarks);
                }
            }

            em.close();
            session.close();

            JsonNode node = HTTPSUtils.ConvertToJsonNode(bookmarksList);
            if (node != null) {
                return ok(node);
            } else {
                return status(422);
            }

        } else {
            return forbidden("Login session expired, please log in");
        }
    }

    public Result GetBookmarks(String token, String name) {
        String email = HTTPSUtils.GetEmailFromToken(token);

        if (!Strings.isNullOrEmpty(email)) {
            SessionFactory sessionFactory = HibernateUtil.getSession();
            Session session = sessionFactory.getCurrentSession();
            EntityManager em = sessionFactory.createEntityManager();
            session.beginTransaction();
            em.getTransaction().begin();

            UserProfile userProfile = em.createQuery("select g from UserProfile g where email = :email", UserProfile.class)
                    .setParameter("email", email)
                    .getSingleResult();

            List<BookmarkGroup> bookmarkGroups = em.createQuery("select b from BookmarkGroup b where b.userprofile_id = :userId", BookmarkGroup.class)
                    .setParameter("userId", userProfile.getId())
                    .getResultList();

            List<List> bookmarksList = new ArrayList<>();
            for (BookmarkGroup groupItem : bookmarkGroups) {
                List bookmarks = em.createQuery("from Bookmark b left join BookmarkGroup bg on b.bookmarkGroup_id = bg.id where bg.userprofile_id = :userId and bg.id = :groupId and bg.name = :name")
                        .setParameter("userId", userProfile.getId())
                        .setParameter("groupId", groupItem.getId())
                        .setParameter("name", name)
                        .getResultList();

                if (!bookmarks.isEmpty()) {
                    bookmarksList.add(bookmarks);
                }
            }

            em.close();
            session.close();

            JsonNode node = HTTPSUtils.ConvertToJsonNode(bookmarksList);
            if (node != null) {
                return ok(node);
            } else {
                return status(422);
            }

        } else {
            return forbidden("Login session expired, please log in");
        }
    }

    public Result EditBookmarkGroupName(Http.Request request) {
        JsonNode node = request.body().asJson();
        if (node == null) {
            return noContent();
        }

        String newName = node.get("newName").textValue();
        Long groupId = node.get("rowId").asLong();

        if (!Strings.isNullOrEmpty(newName)) {
            SessionFactory sessionFactory = HibernateUtil.getSession();
            Session session = sessionFactory.getCurrentSession();
            EntityManager em = sessionFactory.createEntityManager();
            session.beginTransaction();
            em.getTransaction().begin();

            em.createQuery("update from BookmarkGroup set name = :newName where id = :groupId")
                    .setParameter("newName", newName)
                    .setParameter("groupId", groupId)
                    .executeUpdate();

            em.close();
            session.close();

            return ok();
        } else {
            return badRequest();
        }
    }

    public Result DeleteBookmarkGroup(Long id) {

        if (id == null) {
            return noContent();
        }

        SessionFactory sessionFactory = HibernateUtil.getSession();
        Session session = sessionFactory.getCurrentSession();
        EntityManager em = sessionFactory.createEntityManager();
        session.beginTransaction();
        em.getTransaction().begin();

        em.createQuery("delete from Bookmark where bookmarkGroup_id = :id")
                .setParameter("id", id)
                .executeUpdate();

        em.createQuery("delete from BookmarkGroup where id = :id")
                .setParameter("id", id)
                .executeUpdate();

        em.close();
        session.close();

        return ok();
    }
}
