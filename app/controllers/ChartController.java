package controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.saleem.utils.HTTPSUtils;
import play.mvc.Controller;
import play.mvc.Http;
import play.mvc.Result;

public class ChartController extends Controller {

    public Result GetLocations() {
        JsonNode node = HTTPSUtils.RequestJSON("https://ddapi.rws.nl/dd-oper/2.0/locations");
        if (node != null) return ok(node);
        else return status(404);
    }

    public Result GetQuantities() {
        JsonNode node = HTTPSUtils.RequestJSON("https://ddapi.rws.nl/dd-oper/2.0/quantities");
        if (node != null) return ok(node);
        else return status(404);
    }

    public Result GetLocationInfo(String location) {

        if (location.equals("quantities")) {
            return GetQuantities();
        }

        String url = String.format("https://ddapi.rws.nl/dd-oper/2.0/locations/%s/", location);
        JsonNode node = HTTPSUtils.RequestJSON(url);
        if (node != null) return ok(node);
        else return status(404);
    }

    public Result GetQuantitiesOfLocation(String location) {
        String url = String.format("https://ddapi.rws.nl/dd-oper/2.0/locations/%s/quantities", location);
        JsonNode node = HTTPSUtils.RequestJSON(url);
        if (node != null) return ok(node);
        else return status(404);
    }

    public Result GetMeasurementChart(Http.Request request) {
        JsonNode node = request.body().asJson();
        String location = node.get("location").textValue();
        String quantity = node.get("quantity").textValue();
        String startTime = node.get("startTime").textValue() + ":00.0Z";
        String endTime = node.get("endTime").textValue() + ":00.0Z";
        String intervalLength = node.get("interval").textValue();
        String aspectSet = node.get("aspectSet").textValue();

        String url = String.format("https://ddapi.rws.nl/dd-oper/2.0/locations/%s/quantities/%s/timeseries?process=measurement&startTime=%s&endTime=%s&intervalLength=%s&aspectSet=%s",
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

}
