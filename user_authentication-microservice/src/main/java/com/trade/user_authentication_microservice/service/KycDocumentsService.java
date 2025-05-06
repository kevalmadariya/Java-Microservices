package com.trade.user_authentication_microservice.service;

import com.trade.user_authentication_microservice.entity.KycDocuments;
import com.trade.user_authentication_microservice.repository.KycDocumentsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class KycDocumentsService {

    private final KycDocumentsRepository kycDocumentsRepository;

    public KycDocuments submitKyc(KycDocuments kycDocuments) {
        log.info("Submitting KYC for user: {}", kycDocuments.getUser().getUserId());
        return kycDocumentsRepository.save(kycDocuments);
    }

    public Optional<KycDocuments> getKycByUserId(String userId) {
        log.info("Fetching KYC for user ID: {}", userId);
        return kycDocumentsRepository.findByUserUserId(userId);
    }

    public KycDocuments updateKycStatus(String kycId, String status) {
        Optional<KycDocuments> optional = kycDocumentsRepository.findById(kycId);
        if (optional.isPresent()) {
            KycDocuments kyc = optional.get();
            kyc.setKycStatus(status);
            log.info("Updated KYC status to '{}' for kycId: {}", status, kycId);
            return kycDocumentsRepository.save(kyc);
        } else {
            log.warn("KYC document not found with ID: {}", kycId);
            return null;
        }
    }
}
