package com.insurance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = "com.insurance.entities")
@EnableJpaRepositories(basePackages = "com.insurance.repositories")
public class InsuranceSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(InsuranceSystemApplication.class, args);
    }
}
