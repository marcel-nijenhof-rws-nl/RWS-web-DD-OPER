package controllers;

import play.mvc.Controller;
import play.mvc.Result;

public class NavigationController extends Controller {

    public Result bookmarks() {
        return ok(views.html.bookmarks.render());
    }

    public Result charts() {
        return ok(views.html.charts.render());
    }

    public Result login() {
        return ok(views.html.login.render());
    }

    public Result register() {
        return ok(views.html.register.render());
    }

    public Result settings() {
        return ok(views.html.settings.render());
    }

    public Result start() {
        return ok(views.html.start.render());
    }

}
