export interface EventData {
  event_id?: number;
  title: string;
  description?: string;
  event_date: Date;
  duration: number; // Duration in minutes
  status?: 'upcoming' | 'in_progress' | 'completed';
  location?: string;
  event_type: 'academic' | 'cultural' | 'sports';
  capacity: number;
  organizer_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface EventRow {
  event_id: number;
  title: string;
  description: string | null;
  event_date: Date;
  duration: number; // Duration in minutes
  status: 'upcoming' | 'in_progress' | 'completed';
  location: string | null;
  event_type: 'academic' | 'cultural' | 'sports';
  capacity: number;
  organizer_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface EventStats {
  total_events: number;
  active_events: number;
  upcoming_events: number;
  completed_events: number;
  total_participants: number;
}

export interface EventWithOrganizer extends EventRow {
  organizer_name: string;
  organizer_email: string;
  registered_count: number;
}
