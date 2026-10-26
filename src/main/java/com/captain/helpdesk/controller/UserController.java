package com.captain.helpdesk.controller;

import com.captain.helpdesk.entity.User;
import com.captain.helpdesk.services.UserService;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
public class UserController {
    private final UserService userService;

    @PostMapping("/register-user")
    public ResponseEntity<String> register(@RequestBody User user) {
        userService.persist(user);

        return ResponseEntity.ok("User registered successfully");
    }
}
