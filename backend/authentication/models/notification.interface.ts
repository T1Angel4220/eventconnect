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

export interface DashboardStats {
  total_events: number;
  total_participants: number;
  active_events: number;
  upcoming_events: number;
  total_users: number;
  recent_registrations: number;
}
