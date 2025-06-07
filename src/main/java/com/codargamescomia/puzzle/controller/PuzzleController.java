package com.codargamescomia.puzzle.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.codargamescomia.puzzle.entity.PuzzleImage;
import com.codargamescomia.puzzle.repository.PuzzleImageRepository;

@RestController
@RequestMapping("/api/puzzle")
public class PuzzleController {

    private static final Logger logger = LoggerFactory.getLogger(PuzzleController.class);

    @Autowired
    private PuzzleImageRepository imageRepository;

    public PuzzleController() {
        logger.info("PuzzleController initialized");
    }
    
    @GetMapping("/")
    public String home() {
        return "redirect:/puzzle.html";
    }
    
    @GetMapping("/images")
    public ResponseEntity<List<PuzzleImage>> getImages() {
        logger.info("Handling GET /api/puzzle/images");
        return ResponseEntity.ok(imageRepository.findAll());
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyPuzzle(@RequestBody PuzzleSolution solution) {
        logger.info("Handling POST /api/puzzle/verify");
        boolean isCorrect = validateSolution(solution.getPiecePositions(), solution.getCuts());
        return ResponseEntity.ok(isCorrect ? "Correto!" : "Tente novamente.");
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        logger.info("Handling GET /api/puzzle/test");
        return ResponseEntity.ok("Controller is working!");
    }

    private boolean validateSolution(List<Integer> positions, int cuts) {
        if (positions.size() != cuts) {
            return false;
        }
        for (int i = 0; i < cuts; i++) {
            Integer position = positions.get(i);
            if (position == null || position == -1 || position != i) {
                return false; // Fail if any cell is empty (-1), null, or incorrect
            }
        }
        return true;
    }
}

class PuzzleSolution {
    private List<Integer> piecePositions;
    private int cuts;

    public List<Integer> getPiecePositions() { return piecePositions; }
    public void setPiecePositions(List<Integer> piecePositions) { this.piecePositions = piecePositions; }
    public int getCuts() { return cuts; }
    public void setCuts(int cuts) { this.cuts = cuts; }
}