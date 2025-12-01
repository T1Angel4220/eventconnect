import pool from "config/db";
import { NotificationData, NotificationRow } from "authentication/models/notification.interface";

export interface NotificationRepository {
  create(notification: NotificationData): Promise<NotificationRow>;
  findById(notificationId: number): Promise<NotificationRow | null>;
  findByUser(userId: number): Promise<NotificationRow[]>;
  findAll(): Promise<(NotificationRow & { first_name: string; last_name: string; email: string })[]>;
  update(notificationId: number, notification: Partial<NotificationData>): Promise<NotificationRow | null>;
  delete(notificationId: number): Promise<boolean>;
  markAsRead(notificationId: number): Promise<boolean>;
  markAllAsRead(userId: number): Promise<boolean>;
  getUnreadCount(userId: number): Promise<number>;
}

class NotificationRepositoryImpl implements NotificationRepository {
  async create(notification: NotificationData): Promise<NotificationRow> {
    const query = `
      INSERT INTO notifications (user_id, message, status)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [notification.user_id, notification.message, notification.status];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findById(notificationId: number): Promise<NotificationRow | null> {
    const query = 'SELECT * FROM notifications WHERE notification_id = $1';
    const result = await pool.query(query, [notificationId]);
    return result.rows[0] || null;
  }

  async findByUser(userId: number): Promise<NotificationRow[]> {
    const query = `
      SELECT * FROM notifications 
      WHERE user_id = $1 
      ORDER BY sent_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  async update(notificationId: number, notification: Partial<NotificationData>): Promise<NotificationRow | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(notification).forEach(([key, value]) => {
      if (value !== undefined && key !== 'notification_id') {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findById(notificationId);
    }

    values.push(notificationId);

    const query = `
      UPDATE notifications 
      SET ${fields.join(', ')}
      WHERE notification_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(notificationId: number): Promise<boolean> {
    const query = 'DELETE FROM notifications WHERE notification_id = $1';
    const result = await pool.query(query, [notificationId]);
    return result.rowCount > 0;
  }

  async markAsRead(notificationId: number): Promise<boolean> {
    const query = 'UPDATE notifications SET status = $1 WHERE notification_id = $2';
    const result = await pool.query(query, ['read', notificationId]);
    return result.rowCount > 0;
  }

  async markAllAsRead(userId: number): Promise<boolean> {
    const query = 'UPDATE notifications SET status = $1 WHERE user_id = $2 AND status != $1';
    const result = await pool.query(query, ['read', userId]);
    return result.rowCount > 0;
  }

  async getUnreadCount(userId: number): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND status != $2';
    const result = await pool.query(query, [userId, 'read']);
    return parseInt(result.rows[0].count);
  }

  async findAll(): Promise<(NotificationRow & { first_name: string; last_name: string; email: string })[]> {
    const query = `
      SELECT n.*, u.first_name, u.last_name, u.email
      FROM notifications n
      JOIN users u ON n.user_id = u.user_id
      ORDER BY n.sent_at DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }
}

export const notificationRepository = new NotificationRepositoryImpl();
export { NotificationRepositoryImpl };
