export type ApiOptions<TRequest> = {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
    body?: TRequest | FormData;
    isFormData?: boolean;
    token?: string;
};