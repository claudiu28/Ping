import {ApiOptions} from "@/types/api";

export const apiClient = async <TRequest, TResponse>(options: ApiOptions<TRequest>):
    Promise<TResponse> => {

    const {url, method, body, isFormData, token} = options;
    const headers: HeadersInit = {};

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    const bearerToken = token || localStorage.getItem('token');
    if (bearerToken) {
        headers['Authorization'] = `Bearer ${bearerToken}`;
    }

    const res = await fetch(url, {
        method,
        headers,
        body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
    });

    const contentType = res.headers.get("content-type");
    let data: any = null;

    if (contentType && contentType.includes("application/json")) {
        data = await res.json();
    }else if (contentType?.includes("text/plain")) {
        const text = await res.text();
        data = text;
    }

    if (!res.ok) {
        const message = data?.message || res.statusText || 'Something went wrong! Try again!';
        throw new Error(message);
    }

    return data as TResponse;
};
