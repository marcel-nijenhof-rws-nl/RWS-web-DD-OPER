package models;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

@Entity
public class BookmarkGroup {
    private Long id;
    private Long userprofile_id;
    private String name;

    public BookmarkGroup() {

    }

    public BookmarkGroup(Long userprofile_id, String name) {
        this.userprofile_id = userprofile_id;
        this.name = name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setUserprofile_id(Long userprofile_id) {
        this.userprofile_id = userprofile_id;
    }

    public Long getUserprofile_id() {
        return userprofile_id;
    }

    public String getName() {
        return name;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @Id
    @GeneratedValue(generator = "increment")
    public Long getId() {
        return id;
    }
}
