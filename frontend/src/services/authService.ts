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

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error en el login');
    }

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
        throw new Error(error.error || error.message || 'Error en el registro');
    }

    return res.json();
};

export interface ForgotPasswordResponse {
    message: string;
    userId: number;
}

export interface VerifyCodeResponse {
    message: string;
    resetId: number;
}

export interface ResetPasswordResponse {
    message: string;
}

export const forgotPassword = async (email: string): Promise<ForgotPasswordResponse> => {
    const res = await fetch('http://localhost:3001/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || error.message || 'Error solicitando recuperación');
    }

    return res.json();
};

export const verifyResetCode = async (userId: number, code: string): Promise<VerifyCodeResponse> => {
    const res = await fetch('http://localhost:3001/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || error.message || 'Error verificando código');
    }

    return res.json();
};

export const resetPassword = async (resetId: number, newPassword: string): Promise<ResetPasswordResponse> => {
    const res = await fetch('http://localhost:3001/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetId, newPassword })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || error.message || 'Error actualizando contraseña');
    }

    return res.json();
};
