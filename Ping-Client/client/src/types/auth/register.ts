export type RegisterRequest = {
    username: string,
    phone: string,
    password: string,
    confirmPassword: string,
}

export type RegisterResponse = {
    id?: number,
    username?: string,
    phone?: string,
    message: string
}