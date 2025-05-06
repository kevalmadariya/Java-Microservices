package com.trade.user_authentication_microservice.utils;

import org.mindrot.jbcrypt.BCrypt;

public class PasswordUtil {

    // Hash a password for the first time
    public static String hashPassword(String plainTextPassword) {
        return BCrypt.hashpw(plainTextPassword, BCrypt.gensalt());
    }

    // Check that a plain text password matches a previously hashed one
    public static boolean checkPassword(String plainTextPassword, String hashedPassword) {
        return BCrypt.checkpw(plainTextPassword, hashedPassword);
    }

    // Generate a random salt
    public static String generateSalt() {
        return BCrypt.gensalt();
    }

    // Hash a password with a given salt
    public static String hashPasswordWithSalt(String plainTextPassword, String salt) {
        return BCrypt.hashpw(plainTextPassword, salt);
    }
    // Check that a plain text password matches a previously hashed one with a given salt
    public static boolean checkPasswordWithSalt(String plainTextPassword, String hashedPassword, String salt) {
        return BCrypt.checkpw(plainTextPassword, hashPasswordWithSalt(plainTextPassword, salt));
    }
    // Check if a password is strong
    public static boolean isStrongPassword(String password) {
        // Check length
        if (password.length() < 8) {
            return false;
        }
        // Check for uppercase letters
        if (!password.matches(".*[A-Z].*")) {
            return false;
        }
        // Check for lowercase letters
        if (!password.matches(".*[a-z].*")) {
            return false;
        }
        // Check for digits
        if (!password.matches(".*\\d.*")) {
            return false;
        }
        // Check for special characters
        if (!password.matches(".*[!@#$%^&*(),.?\":{}|<>].*")) {
            return false;
        }
        return true;
    }
    

    
}
