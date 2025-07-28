package main.interfaces;

import main.messages.Conversation;
import main.messages.Message;

import java.util.List;

public interface IMessageService {
    Conversation createPrivateConversation(String username1, String username2);

    Conversation createGroupConversation(String groupName, List<String> usernames);

    void deleteConversation(Long conversationId);

    Message sendMessage(Long conversationId, String senderUsername, String content);

    void deleteMessage(Long messageId);

    List<Conversation> getConversationsByUser(String username);

    List<Message> getMessagesConversationId(Long conversationId);
}
