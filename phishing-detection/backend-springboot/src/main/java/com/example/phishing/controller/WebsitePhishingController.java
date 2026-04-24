package com.example.phishing.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/phishing")
@CrossOrigin(origins = "*") 
public class WebsitePhishingController {

    @Autowired
    private RestTemplate restTemplate;

    @GetMapping("/check")
    public Map<String, Object> checkWebsite(@RequestParam String url) {
        // Points to your active Python Flask terminal
        String mlUrl = "http://localhost:5000/predict/url";

        Map<String, String> request = new HashMap<>();
        request.put("url", url);

        try {
            // Forward the request to the ML model and return its findings
            return restTemplate.postForObject(mlUrl, request, Map.class);
        } catch (Exception e) {
            // Fallback if the Python server stops responding
            Map<String, Object> error = new HashMap<>();
            error.put("level", "ML Offline");
            error.put("risk", 0);
            error.put("factors", List.of("Java could not connect to the Python ML engine."));
            return error;
        }
    }
}