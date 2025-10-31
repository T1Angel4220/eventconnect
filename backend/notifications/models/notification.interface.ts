export interface NotificationData {
  notification_id?: number;
  user_id: number;
  message: string;
  sent_at?: Date;
  status: 'sent' | 'pending' | 'read';
}

export interface NotificationRow {
  notification_id: number;
  user_id: number;
  message: string;
  sent_at: Date;
  status: 'sent' | 'pending' | 'read';
}

export interface CreateNotificationRequest {
  user_id: number;
  message: string;
  status?: 'sent' | 'pending' | 'read';
}

export interface UpdateNotificationRequest {
  status?: 'sent' | 'pending' | 'read';
  message?: string;
}