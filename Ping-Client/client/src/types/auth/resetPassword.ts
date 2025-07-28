export interface ResetPasswordRequest {
  newPassword: string;
  verifyPassword: string;
}

export interface ResetPasswordRespond {
  username: string;
  message: string;
}
