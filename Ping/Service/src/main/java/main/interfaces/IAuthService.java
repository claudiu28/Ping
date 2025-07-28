package main.interfaces;

import main.users.User;

public interface IAuthService {
    User register(String username, String phone, String password);

    String sendCode(String phone);

    User resetPassword(String phone, String newPassword);

    boolean verifyCode(String phone, String code);
}
