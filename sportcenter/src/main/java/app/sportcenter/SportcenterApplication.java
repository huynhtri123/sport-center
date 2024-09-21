package app.sportcenter;

import app.sportcenter.services.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

@SpringBootApplication
@RequiredArgsConstructor
public class SportcenterApplication implements CommandLineRunner {
    private final AuthenticationService authenticationService;

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("GMT+07:00"));
        SpringApplication.run(SportcenterApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        authenticationService.autoCreateAdminAccount();
    }
}
