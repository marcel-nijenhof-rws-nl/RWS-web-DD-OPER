package controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.saleem.utils.HTTPSUtils;
import com.saleem.utils.HibernateUtil;
import models.Bookmark;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import play.mvc.Controller;
import play.mvc.Http;
import play.mvc.Result;

import javax.persistence.EntityManager;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Objects;

public class ChartController extends Controller {

    public Result GetLocations() {
        JsonNode node = HTTPSUtils.RequestJSON("locations");
        if (node != null) return ok(node);
        else return status(404);
    }

    public Result GetQuantities() {
        JsonNode node = HTTPSUtils.RequestJSON("quantities");
        if (node != null) return ok(node);
        else return status(404);
    }

    public Result GetLocationsWithQuantity(String quantity) {
        String url = String.format("quantities/%s/locations", quantity);
        JsonNode node = HTTPSUtils.RequestJSON(url);
        if (node != null) return ok(node);
        else return status(404);
    }

    public Result GetLocationInfo(String location) {

        if (location.equals("quantities")) {
            return GetQuantities();
        }

        String url = String.format("locations/%s/", location);
        JsonNode node = HTTPSUtils.RequestJSON(url);
        if (node != null) return ok(node);
        else return status(404);
    }

    public Result GetQuantitiesOfLocation(String location) {
        String url = String.format("locations/%s/quantities", location);
        JsonNode node = HTTPSUtils.RequestJSON(url);
        if (node != null) return ok(node);
        else return status(404);
    }

    public Result GetMeasurementChart(Http.Request request) {
        JsonNode node = request.body().asJson();
        String location = node.get("location").textValue();
        String quantity = node.get("quantity").textValue();
        String intervalLength = node.get("interval").textValue();
        String aspectSet = node.get("aspectSet").textValue();

        String startTime;
        String endTime;
        if (node.get("startTime") == null) {
            Calendar calendar = Calendar.getInstance();
            endTime = calendar.getTime().toInstant().toString();
            calendar.add(Calendar.DATE, -1);
            startTime = calendar.getTime().toInstant().toString();
        } else {
            startTime = node.get("startTime").textValue() + ":00.0Z";
            endTime = node.get("endTime").textValue() + ":00.0Z";
        }

        String url = String.format("locations/%s/quantities/%s/timeseries?process=measurement&startTime=%s&endTime=%s&intervalLength=%s&aspectSet=%s",
                location,
                quantity,
                startTime,
                endTime,
                intervalLength,
                aspectSet);

        JsonNode response = HTTPSUtils.RequestJSON(url);

        if (response != null) return ok(response);
        else return notFound();
    }

    public Result GetChartFromJSON(String token) {
        JsonNode node = HTTPSUtils.ConvertTokenToJsonNode(token);
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode responseNode = mapper.createObjectNode();

        for (int i = 0; i < Objects.requireNonNull(node).get("token").size(); i++) {
            if (node.get("token").get(i).size() > 0) {
                responseNode.set(String.valueOf(i), node.get("token").get(i));
            }
        }

        return ok(responseNode);
    }

    public Result GetChartFromBookmark(Http.Request request) {
        JsonNode node = request.body().asJson();
        ObjectMapper objectMapper = new ObjectMapper();
        ObjectNode objectNode = objectMapper.createObjectNode();
        SessionFactory sessionFactory = HibernateUtil.getSession();
        Session session = sessionFactory.getCurrentSession();
        EntityManager em = sessionFactory.createEntityManager();
        session.beginTransaction();
        em.getTransaction().begin();

        List<Bookmark> bookmarks = new ArrayList<>();

        for (int i = 0; i < node.get("bookmark").size(); i++) {
            Bookmark bookmark = em.createQuery("select b from Bookmark b where b.id = :id", Bookmark.class)
                    .setParameter("id", node.get("bookmark").get(i).get("id").asLong())
                    .getSingleResult();
            bookmarks.add(bookmark);
        }

        objectNode.set("bookmarks", HTTPSUtils.ConvertToJsonNode(bookmarks));

        em.close();
        session.close();
        return ok(objectNode);
    }

    public Result GetPast24HourQuantityOfLocation(String location, String quantity) {
        Calendar calendar = Calendar.getInstance();
        String endTime = calendar.getTime().toInstant().toString();
        calendar.add(Calendar.DATE, -1);
        String startTime = calendar.getTime().toInstant().toString();

        String url = String.format("locations/%s/quantities/%s/timeseries?process=measurement&startTime=%s&endTime=%s",
                location,
                quantity,
                startTime,
                endTime);

        JsonNode node = HTTPSUtils.RequestJSON(url);

        if (node != null) {
            return ok(node);
        } else {
            return notFound();
        }
    }
}
