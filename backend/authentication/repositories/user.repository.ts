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

  async updateProfile(userId: number, profileData: { first_name: string; last_name: string; email: string; profile_image?: string }): Promise<UserRow | undefined> {
    try {
      // Construir query dinámicamente para actualizar solo los campos proporcionados
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      updates.push(`first_name = $${paramIndex++}`);
      values.push(profileData.first_name);

      updates.push(`last_name = $${paramIndex++}`);
      values.push(profileData.last_name);

      updates.push(`email = $${paramIndex++}`);
      values.push(profileData.email);

      // Solo actualizar profile_image si se proporciona explícitamente
      if (profileData.profile_image !== undefined) {
        updates.push(`profile_image = $${paramIndex++}`);
        values.push(profileData.profile_image || null);
      }

      values.push(userId);

      const query = `UPDATE users SET ${updates.join(', ')} WHERE user_id = $${paramIndex} RETURNING user_id, first_name, last_name, email, role, profile_image, created_at`;
      
      const res = await pool.query(query, values);
      return res.rows[0] as UserRow;
    } catch (error) {
      console.error("Error updating user profile:", error);
      return undefined;
    }
  }

  // === MÉTODOS PARA ADMIN ===

  async findAll(): Promise<UserRow[]> {
    try {
      const res = await pool.query("SELECT * FROM users ORDER BY created_at DESC");
      return res.rows;
    } catch (error) {
      console.error("Error finding all users:", error);
      return [];
    }
  }

  async delete(userId: number): Promise<boolean> {
    try {
      const res = await pool.query("DELETE FROM users WHERE user_id = $1", [userId]);
      return res.rowCount ? res.rowCount > 0 : false;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }

  async updateRole(userId: number, newRole: string): Promise<boolean> {
    try {
      const res = await pool.query(
        "UPDATE users SET role = $1 WHERE user_id = $2",
        [newRole, userId]
      );
      return res.rowCount ? res.rowCount > 0 : false;
    } catch (error) {
      console.error("Error updating user role:", error);
      return false;
    }
  }

  async countAll(): Promise<number> {
    try {
      const res = await pool.query("SELECT COUNT(*) as count FROM users");
      return parseInt(res.rows[0].count);
    } catch (error) {
      console.error("Error counting users:", error);
      return 0;
    }
  }

  async countByRole(): Promise<Record<string, number>> {
    try {
      const res = await pool.query(`
        SELECT role, COUNT(*) as count 
        FROM users 
        GROUP BY role
      `);
      
      const result: Record<string, number> = {};
      res.rows.forEach(row => {
        result[row.role] = parseInt(row.count);
      });
      
      return result;
    } catch (error) {
      console.error("Error counting users by role:", error);
      return {};
    }
  }
}

export const userRepository = new UserRepository();
export { UserRepository };
