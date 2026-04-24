package com.example.phishing.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/sms")
@CrossOrigin(origins = "*")
public class SmsController {

    @PostMapping("/check")
    public Map<String, Object> checkSms(@RequestBody String sms) {

        sms = sms.toLowerCase();

        int risk = 0;
        List<String> factors = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();

        // SIMPLE RULE-BASED LOGIC (works without ML)
        if (sms.contains("http") || sms.contains("www")) {
            risk += 30;
            factors.add("Contains suspicious link");
        }

        if (sms.contains("otp") || sms.contains("verify") || sms.contains("account")) {
            risk += 30;
            factors.add("Asks for sensitive information");
        }

        if (sms.contains("urgent") || sms.contains("winner") || sms.contains("free")) {
            risk += 20;
            factors.add("Uses urgency or rewards");
        }

        String level;
        if (risk >= 60) {
            level = "High Risk";
            suggestions.add("Do not click links");
            suggestions.add("Block and report the sender");
        } else if (risk >= 30) {
            level = "Medium Risk";
            suggestions.add("Verify sender manually");
        } else {
            level = "Low Risk";
            suggestions.add("Looks safe, but stay alert");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("risk", risk);
        response.put("level", level);
        response.put("factors", factors);
        response.put("suggestions", suggestions);

        return response;
    }
}

