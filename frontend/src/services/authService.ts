export interface LoginResponse {
    token: string;
    role: string;
    firstName: string;
}

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
    const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (!res.ok) throw await res.json();

    return res.json();
};
