const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const User = require('../models/user');
const PasswordReset = require('../models/passwordReset');
const { sendPasswordResetCode, sendPasswordChangeConfirmation } = require('../services/emailService');
require('dotenv').config({ path: './config/.env' });

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByEmail(email);

        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ message: 'Contraseña incorrecta' });

        const token = jwt.sign(
            { userId: user.user_id, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({ token, role: user.role, firstName: user.first_name });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Validar que todos los campos estén presentes
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Formato de email inválido' });
        }

        // Validar longitud de contraseña
        if (password.length < 6) {
            return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
        }

        // Verificar si el usuario ya existe
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'El email ya está registrado' });
        }

        // Encriptar contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Crear usuario (solo como organizador)
        const userData = {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: 'organizer'
        };

        const newUser = await User.create(userData);

        // Generar token
        const token = jwt.sign(
            { userId: newUser.user_id, role: newUser.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            role: newUser.role,
            firstName: newUser.first_name
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Función para generar código de 6 dígitos
const generateResetCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Solicitar recuperación de contraseña
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'El email es obligatorio' });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Formato de email inválido' });
        }

        // Buscar usuario por email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({ 
                message: 'Correo inexistente' 
            });
        }

        // Invalidar códigos anteriores del usuario
        await PasswordReset.invalidateUserCodes(user.user_id);

        // Generar nuevo código
        const resetCode = generateResetCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

        // Guardar código en la base de datos
        await PasswordReset.create(user.user_id, resetCode, expiresAt);

        // Enviar email con el código
        const emailResult = await sendPasswordResetCode(user.email, user.first_name, resetCode);
        
        if (!emailResult.success) {
            console.error('Error enviando email:', emailResult.error);
            return res.status(500).json({ message: 'Error enviando el código de recuperación' });
        }

        res.status(200).json({ 
            message: 'Código de recuperación enviado a tu email',
            userId: user.user_id // Necesario para el frontend
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Verificar código de recuperación
exports.verifyResetCode = async (req, res) => {
    try {
        const { userId, code } = req.body;

        if (!userId || !code) {
            return res.status(400).json({ message: 'Usuario y código son obligatorios' });
        }

        if (code.length !== 6 || !/^\d+$/.test(code)) {
            return res.status(400).json({ message: 'El código debe ser de 6 dígitos numéricos' });
        }

        // Buscar código válido
        const resetCode = await PasswordReset.findValidCode(userId, code);
        
        if (!resetCode) {
            return res.status(400).json({ message: 'Código inválido o expirado' });
        }

        res.status(200).json({ 
            message: 'Código verificado correctamente',
            resetId: resetCode.reset_id
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Actualizar contraseña con código
exports.resetPassword = async (req, res) => {
    try {
        const { resetId, newPassword } = req.body;

        if (!resetId || !newPassword) {
            return res.status(400).json({ message: 'ID de reset y nueva contraseña son obligatorios' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
        }

        // Buscar el código de reset válido
        const pool = require('../models/db');
        const resetResult = await pool.query(
            'SELECT * FROM password_reset_codes WHERE reset_id = $1 AND expires_at > NOW() AND used = FALSE',
            [resetId]
        );

        if (resetResult.rows.length === 0) {
            return res.status(400).json({ message: 'Código de recuperación inválido o expirado' });
        }

        const resetCode = resetResult.rows[0];

        // Obtener información del usuario
        const userResult = await pool.query(
            'SELECT * FROM users WHERE user_id = $1',
            [resetCode.user_id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const user = userResult.rows[0];

        // Encriptar nueva contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Actualizar contraseña en la base de datos
        await pool.query(
            'UPDATE users SET password = $1 WHERE user_id = $2',
            [hashedPassword, user.user_id]
        );

        // Marcar código como usado
        await PasswordReset.markAsUsed(resetCode.reset_id);

        // Enviar email de confirmación
        await sendPasswordChangeConfirmation(user.email, user.first_name);

        res.status(200).json({ 
            message: 'Contraseña actualizada exitosamente' 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};