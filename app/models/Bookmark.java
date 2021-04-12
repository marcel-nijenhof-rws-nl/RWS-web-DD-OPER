package models;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

@Entity
public class Bookmark {
    public Bookmark() {

    }

    public Bookmark(Long bookmarkGroup_id,
                    String location,
                    String quantity,
                    String aspectSet,
                    String interval) {
        this.bookmarkGroup_id = bookmarkGroup_id;
        this.location = location;
        this.quantity = quantity;
        this.aspectSet = aspectSet;
        this.interval = interval;
    }

    @Id
    @GeneratedValue(generator = "increment")
    private Long id;
    private Long bookmarkGroup_id;
    private String location;
    private String quantity;
    private String aspectSet;
    private String interval;

    public Long getBookmarkGroup_id() {
        return bookmarkGroup_id;
    }

    public void setBookmarkGroup_id(Long userprofile_id) {
        this.bookmarkGroup_id = userprofile_id;
    }

    public String getQuantity() {
        return quantity;
    }

    public void setQuantity(String quantity) {
        this.quantity = quantity;
    }

    public String getAspectSet() {
        return aspectSet;
    }

    public void setAspectSet(String aspectSet) {
        this.aspectSet = aspectSet;
    }

    public String getInterval() {
        return interval;
    }

    public void setInterval(String interval) {
        this.interval = interval;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return this.id;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getLocation() {
        return this.location;
    }

}
