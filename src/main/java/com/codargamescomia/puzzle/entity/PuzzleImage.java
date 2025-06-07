package com.codargamescomia.puzzle.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class PuzzleImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name; // Ex.: "Flowers in a Vase"
    private String path; // Ex.: "/images/puzzle/flowers-vase.jpg"
    private String license; // Ex.: "CC0"
}