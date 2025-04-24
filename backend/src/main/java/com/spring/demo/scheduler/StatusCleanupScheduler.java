package com.spring.demo.scheduler;

import com.spring.demo.service.StatusService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class StatusCleanupScheduler {
    private final StatusService statusService;

    public StatusCleanupScheduler(StatusService statusService) {
        this.statusService = statusService;
    }

    @Scheduled(fixedRate = 3600000) // Run every hour
    public void cleanupExpiredStatuses() {
        statusService.deactivateExpiredStatuses();
    }
}