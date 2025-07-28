export type LoginRequest ={
    username: string,
    password: string,
    verifyPassword: string
}

export type LoginResponse = {
    id?: number,
    username?: string,
    token?: string
    message: string,
}