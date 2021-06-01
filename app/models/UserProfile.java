package models;


import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

@Entity
public class UserProfile {

    public UserProfile() {
    }

    public UserProfile(String firstname, String lastname, String email, String password) {
        this.setFirstname(firstname);
        this.setLastname(lastname);
        this.setEmail(email);
        this.setPassword(password);
        this.setDatabaseUrl("https://ddapi.rws.nl");
    }


    @Id
    @GeneratedValue(generator = "increment")
    private Long id;

    private String email;
    private String password;
    private String firstname;
    private String lastname;
    private String databaseUrl;

    public String getFirstname() {
        return this.firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastname() {
        return this.lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public String getEmail() {
        return this.email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return this.password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return this.id;
    }

    public void setDatabaseUrl(String url) { this.databaseUrl = url; }

    public String getDatabaseUrl() { return this.databaseUrl; }
}
