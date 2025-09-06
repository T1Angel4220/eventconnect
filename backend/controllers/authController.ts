import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import env from "../config/env";
import pool from "../models/db";
import {
  sendPasswordChangeConfirmation,
  sendPasswordResetCode,
} from "../services/emailService";
import {
  createResetCode,
  getResetCode,
  invalidateUserCodes,
  markCodeAsUsed,
} from "../services/restCodeService";
import { createUser, getUserByEmail } from "../services/userService";

const JWT_SECRET = env.jwt.secret as Secret;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET no está definido en las variables de entorno");
}
const JWT_EXPIRES_IN = env.jwt.expiresIn as jwt.SignOptions["expiresIn"];
if (!JWT_EXPIRES_IN) {
  throw new Error(
    "JWT_EXPIRES_IN no está definido en las variables de entorno",
  );
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email y contraseña son obligatorios" });
    }

    const user = await getUserByEmail(email);

    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    if (!user.password) {
      return res
        .status(500)
        .json({ message: "El usuario no tiene contraseña registrada" });
    }
    const validPassword = await bcrypt.compare(
      password,
      user.password as string,
    );
    if (!validPassword)
      return res.status(401).json({ message: "Contraseña incorrecta" });

    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    res.json({ token, role: user.role, firstName: user.first_name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validar que todos los campos estén presentes
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios, para crear el usuario",
      });
    }

    // Validar formato de email
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Formato de email inválido" });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Verificar si el usuario ya existe
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "El email ya está registrado" });
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
      role: "organizer",
    };

    const newUser = await createUser(userData);
    if (!newUser) {
      return res.status(500).json({ message: "No se pudo crear el usuario" });
    }
    // Generar token
    const token = jwt.sign(
      { userId: newUser.user_id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );
    res.status(201).json({
      message: "Usuario registrado exitosamente",
      token,
      role: newUser.role,
      firstName: newUser.first_name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Función para generar código de 6 dígitos
const generateResetCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Solicitar recuperación de contraseña
export const sendResetCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "El email es obligatorio" });
    }

    // Validar formato de email
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Formato de email inválido" });
    }

    // Buscar usuario por email
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        message: "Correo inexistente",
      });
    }

    // Invalidar códigos anteriores del usuario
    await invalidateUserCodes(user.user_id);

    // Generar nuevo código
    const resetCode = generateResetCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Guardar código en la base de datos
    await createResetCode(user.user_id, resetCode, expiresAt);

    // Enviar email con el código
    const emailResult = await sendPasswordResetCode(
      user.email,
      user.first_name,
      resetCode,
    );

    if (!emailResult.success) {
      console.error("Error enviando email:", emailResult.error);
      return res
        .status(500)
        .json({ message: "Error enviando el código de recuperación" });
    }

    res.status(200).json({
      message: "Código de recuperación enviado a tu email",
      userId: user.user_id, // Necesario para el frontend
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Verificar código de recuperación
export const verifyResetCode = async (req: Request, res: Response) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res
        .status(400)
        .json({ message: "Usuario y código son obligatorios" });
    }

    if (code.length !== 6 || !/^\d+$/.test(code)) {
      return res
        .status(400)
        .json({ message: "El código debe ser de 6 dígitos numéricos" });
    }

    // Buscar código válido
    const resetCode = await getResetCode(userId, code);

    if (!resetCode) {
      return res.status(400).json({ message: "Código inválido o expirado" });
    }

    res.status(200).json({
      message: "Código verificado correctamente",
      resetId: resetCode.reset_id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Actualizar contraseña con código
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { resetId, newPassword } = req.body;

    if (!resetId || !newPassword) {
      return res
        .status(400)
        .json({ message: "ID de reset y nueva contraseña son obligatorios" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Buscar el código de reset válido
    const resetResult = await pool.query(
      "SELECT * FROM password_reset_codes WHERE reset_id = $1 AND expires_at > NOW() AND used = FALSE",
      [resetId],
    );

    if (resetResult.rows.length === 0) {
      return res
        .status(400)
        .json({ message: "Código de recuperación inválido o expirado" });
    }

    const resetCode = resetResult.rows[0];

    // Obtener información del usuario
    const userResult = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [resetCode.user_id],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = userResult.rows[0];

    // Encriptar nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña en la base de datos
    await pool.query("UPDATE users SET password = $1 WHERE user_id = $2", [
      hashedPassword,
      user.user_id,
    ]);

    // Marcar código como usado
    await markCodeAsUsed(resetCode.reset_id);

    // Enviar email de confirmación
    await sendPasswordChangeConfirmation(user.email, user.first_name);

    res.status(200).json({
      message: "Contraseña actualizada exitosamente",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
