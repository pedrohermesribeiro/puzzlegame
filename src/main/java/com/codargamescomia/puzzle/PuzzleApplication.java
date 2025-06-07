package com.codargamescomia.puzzle;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.codargamescomia.puzzle")
public class PuzzleApplication {
    public static void main(String[] args) {
        SpringApplication.run(PuzzleApplication.class, args);
    }
}