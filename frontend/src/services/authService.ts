export interface LoginResponse {
    token: string;
    role: string;
    firstName: string;
}

export interface RegisterResponse {
    message: string;
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

export const registerUser = async (firstName: string, lastName: string, email: string, password: string): Promise<RegisterResponse> => {
    const res = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error en el registro');
    }

    return res.json();
};
