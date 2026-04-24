package com.example.phishing.controller;

import com.example.phishing.model.ScanHistory;
import com.example.phishing.repository.ScanHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/history")
@CrossOrigin(origins = "*") 
public class HistoryController {

    @Autowired
    private ScanHistoryRepository repository;

    @PostMapping("/save")
    public ScanHistory saveHistory(@RequestBody ScanHistory history) {
        return repository.save(history);
    }

    @GetMapping("/all")
    public List<ScanHistory> getAllHistory() {
        return repository.findAll();
    }
}