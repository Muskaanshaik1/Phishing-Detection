package com.example.phishing.controller;

import com.example.phishing.security.JwtUtil;
import com.example.phishing.entity.User;
import com.example.phishing.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")

public class AuthController {

    private final UserRepository repo;
    private final BCryptPasswordEncoder encoder;

    public AuthController(UserRepository repo,
                          BCryptPasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    @PostMapping("/signup")
    public String signup(@RequestBody Map<String, String> data) {

        if (repo.findByEmail(data.get("email")).isPresent()) {
            return "User already exists";
        }

        User user = new User(
                data.get("email"),
                encoder.encode(data.get("password"))
        );

        repo.save(user);
        return "Signup successful";
    }

    
    @PostMapping("/login")
public String login(@RequestBody Map<String, String> data) {

    User user = repo.findByEmail(data.get("email")).orElse(null);

    if (user == null) {
        return "User not found";
    }

    if (!encoder.matches(data.get("password"), user.getPassword())) {
        return "Invalid credentials";
    }

    return JwtUtil.generateToken(user.getEmail());
}

}

