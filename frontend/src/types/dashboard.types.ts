export interface DashboardStats {
  total_events: number;
  total_participants: number;
  active_events: number;
  upcoming_events: number;
  total_users: number;
  recent_registrations: number;
}

export interface DashboardStatsWithGrowth extends DashboardStats {
  growth: {
    events_growth: number;
    participants_growth: number;
    active_events_growth: number;
    upcoming_events_growth: number;
    users_growth: number;
    registrations_growth: number;
  };
}

export interface EventWithOrganizer {
  event_id: number;
  title: string;
  description: string | null;
  event_date: string;
  duration: number; // Duration in minutes
  status: 'upcoming' | 'in_progress' | 'completed';
  location: string | null;
  event_type: 'academic' | 'cultural' | 'sports';
  capacity: number;
  organizer_id: number;
  created_at: string;
  updated_at: string;
  organizer_name: string;
  organizer_email: string;
  registered_count: number;
}

export interface TopUser {
  user_id: number;
  user_name: string;
  events_attended: number;
  favorite_category: string;
  join_date: string;
}

export interface RecentRegistration {
  registration_id: number;
  user_id: number;
  event_id: number;
  registered_at: string;
  status: 'registered' | 'canceled';
  user_name: string;
  user_email: string;
  event_title: string;
  event_date: string;
}

export interface EventCategory {
  category: string;
  count: number;
  percentage: number;
}

export interface Notification {
  notification_id: number;
  message: string;
  sent_at: string;
  status: 'sent' | 'pending' | 'read';
  is_unread: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
