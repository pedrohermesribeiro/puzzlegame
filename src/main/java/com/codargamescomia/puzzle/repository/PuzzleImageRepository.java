package com.codargamescomia.puzzle.repository;

import com.codargamescomia.puzzle.entity.PuzzleImage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PuzzleImageRepository extends JpaRepository<PuzzleImage, Long> {
}