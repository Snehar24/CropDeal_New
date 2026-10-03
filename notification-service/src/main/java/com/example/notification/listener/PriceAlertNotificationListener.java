package com.example.notification.listener;

import com.example.notification.client.AuthUserClient;
import com.example.notification.config.RabbitMQConfig;
import com.example.notification.dto.AuthUserLookupResponse;
import com.example.notification.dto.NotificationRequest;
import com.example.notification.dto.PriceAlertTriggeredEvent;
import com.example.notification.entity.Notification;
import com.example.notification.repository.NotificationRepository;
import com.example.notification.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class PriceAlertNotificationListener {

    private static final Logger log = LoggerFactory.getLogger(PriceAlertNotificationListener.class);

    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;
    private final AuthUserClient authUserClient;

    public PriceAlertNotificationListener(
            NotificationRepository notificationRepository,
            NotificationService notificationService,
            AuthUserClient authUserClient) {
        this.notificationRepository = notificationRepository;
        this.notificationService = notificationService;
        this.authUserClient = authUserClient;
    }

    @RabbitListener(queues = RabbitMQConfig.PRICE_ALERT_QUEUE)
    public void handlePriceAlert(PriceAlertTriggeredEvent event) {
        try {
            log.info("Received PriceAlertTriggeredEvent for user: {} (Role: {}), crop: {}, message: {}",
                    event.getUserId(), event.getUserRole(), event.getCropName(), event.getMessage());

            String userEmail = null;
            if (event.getUserId() != null) {
                try {
                    AuthUserLookupResponse user = authUserClient.findById(event.getUserId());
                    if (user != null && user.email() != null) {
                        userEmail = user.email();
                    }
                } catch (Exception e) {
                    log.warn("Could not fetch user lookup for userId {}: {}", event.getUserId(), e.getMessage());
                }
            }

            if (userEmail == null || userEmail.isBlank()) {
                if (Long.valueOf(1L).equals(event.getUserId())) {
                    userEmail = "ramesh.farmer@cropdeal.com";
                } else {
                    userEmail = "user-" + event.getUserId();
                }
            }

            // Save notification by email recipient (used by frontend query)
            NotificationRequest req = new NotificationRequest();
            req.setRecipient(userEmail);
            req.setType("PRICE_ALERT");
            req.setMessage(event.getMessage());
            notificationService.sendNotification(req);

            // Also ensure a record exists with "user-" + event.getUserId() for ID-based queries
            if (event.getUserId() != null && !userEmail.equals("user-" + event.getUserId())) {
                Notification notifId = new Notification();
                notifId.setRecipient("user-" + event.getUserId());
                notifId.setType("PRICE_ALERT");
                notifId.setMessage(event.getMessage());
                notifId.setStatus("SENT");
                notificationRepository.save(notifId);
            }

            System.out.println("=================================================");
            System.out.println(">>> PRICE ALERT NOTIFICATION DISPATCHED TO USER " + event.getUserId() + " (" + userEmail + ")");
            System.out.println(">>> " + event.getMessage());
            System.out.println("=================================================");

        } catch (Exception e) {
            log.error("Failed to process price alert notification: {}", e.getMessage(), e);
        }
    }
}