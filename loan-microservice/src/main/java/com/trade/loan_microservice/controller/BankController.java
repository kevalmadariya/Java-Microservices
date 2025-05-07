package com.trade.loan_microservice.controller;

import com.trade.loan_microservice.dto.LoginRequestDto;
import com.trade.loan_microservice.dto.LoginResponseDto;
import com.trade.loan_microservice.models.*;
import com.trade.loan_microservice.service.*;

import jakarta.ws.rs.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bank")
@RequiredArgsConstructor
public class BankController {
    private final BankService bankService;
    private final JwtService jwtService;

    @PostMapping("/signup")
    public ResponseEntity<Bank> addBank(@RequestBody Bank bank) {
        return ResponseEntity.ok(bankService.addBank(bank));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginRequestDto lreqd) {
        Bank bank = bankService.findByEmail(lreqd.getEmail()).orElse(null);
        // 2. Simple password comparison (not secure for production!)
        if (!lreqd.getPassword().equals(bank.getPassword())) {
            throw new BadRequestException("Invalid password");
        }


        LoginResponseDto lresd = new LoginResponseDto();
        lresd.setBankId(bank.getId());
        lresd.setToken(jwtService.generateAccessToken(bank));
        // 3. Generate and return response
        return ResponseEntity.ok(lresd);
    }

    @DeleteMapping("/{id}")
    public void deleteBank(@PathVariable String id) {
        bankService.deleteBank(id);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bank> getBank(@PathVariable String id) {
        return bankService.getBank(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<Bank> getAllBanks() {
        return bankService.getAllBanks();
    }

}
