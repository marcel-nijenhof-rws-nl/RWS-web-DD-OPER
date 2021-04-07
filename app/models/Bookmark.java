package models;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

@Entity
public class Bookmark {
    public Bookmark() {

    }

    public Bookmark(Long userprofile_id,
                    String name,
                    String location,
                    String quantity,
                    String aspectSet,
                    String interval,
                    String startTime,
                    String endTime) {
        this.userprofile_id = userprofile_id;
        this.name = name;
        this.location = location;
        this.quantity = quantity;
        this.aspectSet = aspectSet;
        this.interval = interval;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    @Id
    @GeneratedValue(generator = "increment")
    private Long id;
    private Long userprofile_id;

    private String name;
    private String location;
    private String quantity;
    private String aspectSet;
    private String interval;
    private String startTime;
    private String endTime;

    public Long getUserprofile_id() {
        return userprofile_id;
    }

    public void setUserprofile_id(Long userprofile_id) {
        this.userprofile_id = userprofile_id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
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
