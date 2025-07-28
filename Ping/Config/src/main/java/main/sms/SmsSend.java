package main.sms;

import com.vonage.client.VonageClient;
import com.vonage.client.sms.MessageStatus;
import com.vonage.client.sms.SmsSubmissionResponse;
import com.vonage.client.sms.messages.TextMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SmsSend {
    @Value("${vonage.api.key}")
    private String apiKey;

    @Value("${vonage.api.secret}")
    private String apiSecret;

    @Value("${vonage.api.from}")
    private String from;

    public String formatNumber(String to) throws Exception {
        if (to.startsWith("0")) {
            throw new Exception("Format is incorrect");
        }
        to = "40" + to;
        return to;
    }

    public void sendSms(String to, String message) throws Exception {
        VonageClient client = VonageClient.builder().apiKey(apiKey).apiSecret(apiSecret).build();
        to = formatNumber(to);
        TextMessage textMessage = new TextMessage(from, to, message);
        SmsSubmissionResponse response = client.getSmsClient().submitMessage(textMessage);
        if (response.getMessages().getFirst().getStatus() == MessageStatus.OK) {
            log.info("SMS sent successfully to {}", to);
        } else {
            log.error("Failed to send SMS to {}. Status: {}", to, response.getMessages().getFirst().getStatus());
            throw new Exception("Sms could not be send to user");
        }
    }
}