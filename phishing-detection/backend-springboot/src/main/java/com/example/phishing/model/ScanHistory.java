package com.example.phishing.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "SCAN_HISTORY")
public class ScanHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String type;
    private String contentSnippet;
    private Integer riskScore;
    private String result;
    private LocalDateTime scanDate = LocalDateTime.now();

    public ScanHistory() {}

    // Getters and Setters
    public Long getId() { return id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getContentSnippet() { return contentSnippet; }
    public void setContentSnippet(String contentSnippet) { this.contentSnippet = contentSnippet; }
    public Integer getRiskScore() { return riskScore; }
    public void setRiskScore(Integer riskScore) { this.riskScore = riskScore; }
    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }
}