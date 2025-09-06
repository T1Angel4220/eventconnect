import pool from "./db";

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
}

export interface UserRow {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  created_at: Date;
  password?: string;
}

const User = {
  findById: async (userId: number): Promise<UserRow | undefined> => {
    const res = await pool.query("SELECT * FROM users WHERE user_id=$1", [
      userId,
    ]);
    return res.rows[0];
  },

  findByEmail: async (email: string): Promise<UserRow | undefined> => {
    const res = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    return res.rows[0];
  },

  create: async (userData: UserData): Promise<UserRow | undefined> => {
    const {
      firstName,
      lastName,
      email,
      password,
      role = "organizer",
    } = userData;
    const res = await pool.query(
      "INSERT INTO users (first_name, last_name, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, first_name, last_name, email, role, created_at",
      [firstName, lastName, email, password, role],
    );
    return res.rows[0];
  },

  updatePassword: async (
    userId: number,
    newPassword: string,
  ): Promise<boolean> => {
    const res = await pool.query(
      "UPDATE users SET password = $1 WHERE user_id = $2",
      [newPassword, userId],
    );
    return res.rowCount == null ? false : res.rowCount > 0;
  },
};

export default User;
