package com.trade.user_authentication_microservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.trade.user_authentication_microservice.entity.User;
import com.trade.user_authentication_microservice.entity.AuthCredentials;
import com.trade.user_authentication_microservice.exception.BadRequestException;
import com.trade.user_authentication_microservice.exception.ResourceNotFoundException;
import com.trade.user_authentication_microservice.repository.*;
import com.trade.user_authentication_microservice.utils.PasswordUtil;

import com.trade.user_authentication_microservice.dto.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final ModelMapper modelMapper;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthCredentialsRepository authCredentialsRepository;
    private final AuthCredentialsService authCredentialsService;

    public String login(LoginRequestDto loginRequestDto) {
        User user = (User) userRepository.findByEmail(loginRequestDto.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if(authCredentialsService.isAccountLocked(user.getUserId())) {
            throw new BadRequestException("Account is locked. Please contact support.");
        }
        
        AuthCredentials authcre = (AuthCredentials) authCredentialsRepository.findByUserUserId(user.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (PasswordUtil.checkPassword(loginRequestDto.getPassword(), authcre.getHashedPassword())) {
            log.info("User with id {} logged in", user.getUserId());
            authCredentialsService.updateLoginInfo(authcre.getAuthId(), true);cdcd ..
            return jwtService.generateAccessToken(user);
        } else {
            log.warn("Invalid password for user with id {}", user.getUserId());
            authCredentialsService.updateLoginInfo(authcre.getAuthId(), false);
            throw new BadRequestException("Invalid password");
        }

    }

    public UserDto signup(SignupRequestDto signupRequestDto) {
        boolean exists = userRepository.existsByEmail(signupRequestDto.getEmail());

        if (exists) {
            throw new BadRequestException("User with email " + signupRequestDto.getEmail() + " already exists");
        }

        User user = modelMapper.map(signupRequestDto, User.class);
        AuthCredentials authcre = new AuthCredentials();
        authcre.setUser(user);
        authcre.setHashedPassword(PasswordUtil.hashPassword(signupRequestDto.getPassword()));
        authcre.setAuthProvider("local");
        authcre.setLoginAttempts(0);
        authcre.setLocked(false);
        authcre.setLastLogin(null);
        authcre.setSalt(PasswordUtil.generateSalt());
        
        
        User savedUser = userRepository.save(user);
        log.info("User with id {} signed up", savedUser.getUserId());
        authcre.setUser(savedUser);
        authCredentialsRepository.save(authcre);
        return modelMapper.map(savedUser, UserDto.class);
    }
    
    public void resetPassword(String email, String newPassword) {
        User user = (User) userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        AuthCredentials authcre = (AuthCredentials) authCredentialsRepository.findByUserUserId(user.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        authcre.setHashedPassword(PasswordUtil.hashPassword(newPassword));
        authCredentialsRepository.save(authcre);
        log.info("Password reset for user with id {}", user.getUserId());
    }

}
