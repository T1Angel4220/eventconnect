export interface LoginResponse {
    token: string;
    role: string;
    firstName: string;
    userId: number;
}

export interface RegisterResponse {
    message: string;
    token: string;
    role: string;
    firstName: string;
    userId: number;
}

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
    const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || error.error || 'Error en el login');
    }

    const data = await res.json();
    
    // Transformar la respuesta del backend al formato esperado por el frontend
    return {
        token: data.token,
        role: data.user.role,
        firstName: data.user.first_name,
        userId: data.user.user_id
    };
};

export const registerUser = async (firstName: string, lastName: string, email: string, password: string): Promise<RegisterResponse> => {
    const res = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || error.error || 'Error en el registro');
    }

    const data = await res.json();
    
    // Transformar la respuesta del backend al formato esperado por el frontend
    return {
        message: data.message,
        token: data.token,
        role: data.user.role,
        firstName: data.user.first_name,
        userId: data.user.user_id
    };
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
        throw new Error(error.message || error.error || 'Error solicitando recuperación');
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
        throw new Error(error.message || error.error || 'Error verificando código');
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
        throw new Error(error.message || error.error || 'Error actualizando contraseña');
    }

    return res.json();
};
