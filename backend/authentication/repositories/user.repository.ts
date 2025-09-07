import User from "authentication/models/userModel";
import { UserRow } from "authentication/models/userRow.interface";
import pool from "@config/db";

class UserRepository {
  async create(userData: User): Promise<UserRow | undefined> {
    const { firstName, lastName, email, password, role } = userData;
    try {
      const res = await pool.query(
        "INSERT INTO users (first_name, last_name, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, first_name, last_name, email, role, created_at",
        [firstName, lastName, email, password, role],
      );
      return res.rows[0] as UserRow;
    } catch (error) {
      console.error("Error creating user:", error);
      return undefined;
    }
  }

  async updatePassword(userId: number, newPassword: string): Promise<boolean> {
    try {
      const res = await pool.query(
        "UPDATE users SET password = $1 WHERE user_id = $2",
        [newPassword, userId],
      );
      return res.rowCount == null ? false : res.rowCount > 0;
    } catch (error) {
      console.error("Error updating password:", error);
      return false;
    }
  }

  async findById(userId: number): Promise<UserRow | undefined> {
    try {
      const res = await pool.query("SELECT * FROM users WHERE user_id=$1", [
        userId,
      ]);
      return res.rows[0];
    } catch (error) {
      console.error("Error finding user by ID:", error);
      return undefined;
    }
  }

  async findByEmail(email: string): Promise<UserRow | undefined> {
    try {
      const res = await pool.query("SELECT * FROM users WHERE email=$1", [
        email,
      ]);
      return res.rows[0];
    } catch (error) {
      console.error("Error finding user by email:", error);
      return undefined;
    }
  }
}

export const userRepository = new UserRepository();
export { UserRepository };
