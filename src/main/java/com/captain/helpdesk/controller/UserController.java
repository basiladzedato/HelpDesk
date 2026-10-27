package com.captain.helpdesk.controller;

import com.captain.helpdesk.entity.User;
import com.captain.helpdesk.services.UserService;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RequiredArgsConstructor
@RestController
public class UserController {
    private final UserService userService;

    @PostMapping("/register-user")
    public ResponseEntity<String> register(@RequestBody User user) {
        userService.persist(user);

        return ResponseEntity.ok("User registered successfully");
    }

    @GetMapping("/api/me")
    public Map<String, String> me(Authentication authentication) {
        String role = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .filter(authority -> authority.startsWith("ROLE_"))
                .map(authority -> authority.substring(5))
                .findFirst()
                .orElse("USER");

        return Map.of(
                "username", authentication.getName(),
                "role", role
        );
    }
}
