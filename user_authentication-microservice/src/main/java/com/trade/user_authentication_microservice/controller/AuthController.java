package com.trade.user_authentication_microservice.controller;

import com.trade.user_authentication_microservice.dto.LoginRequestDto;
import com.trade.user_authentication_microservice.dto.SignupRequestDto;
import com.trade.user_authentication_microservice.dto.UserDto;
import com.trade.user_authentication_microservice.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    // Login Endpoint
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequestDto loginRequestDto) {
        log.info("Login request received for email: {}", loginRequestDto.getEmail());
        String token = authService.login(loginRequestDto);
        return ResponseEntity.ok(token);
    }

    // Signup Endpoint
    @PostMapping("/signup")
    public ResponseEntity<UserDto> signup(@RequestBody SignupRequestDto signupRequestDto) {
        log.info("Signup request received for email: {}", signupRequestDto.getEmail());
        UserDto userDto = authService.signup(signupRequestDto);
        return ResponseEntity.ok(userDto);
    }

    // Reset Password Endpoint
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestParam String email, @RequestParam String newPassword) {
        log.info("Reset password request received for email: {}", email);
        authService.resetPassword(email, newPassword);
        return ResponseEntity.ok("Password reset successful");
    }
}
