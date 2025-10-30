export interface EventEntity {
  event_id: number;
  title: string;
  description: string | null;
  event_date: Date;
  duration: number; // Duration in minutes
  status: "upcoming" | "in_progress" | "completed";
  location: string | null;
  event_type: "academico" | "cultural" | "deportivo";
  capacity: number;
  organizer_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateEventDto {
  title: string;
  description?: string;
  event_date: string; // ISO datetime string
  duration: number; // Duration in minutes
  status?: "upcoming" | "in_progress" | "completed"; // Optional, defaults to 'upcoming'
  location?: string;
  event_type: "academico" | "cultural" | "deportivo";
  capacity: number;
}

export interface EventData {
  event_id?: number;
  title: string;
  description?: string;
  event_date: Date;
  duration: number; // Duration in minutes
  status?: "upcoming" | "in_progress" | "completed";
  location?: string;
  event_type: "academico" | "cultural" | "deportivo";
  capacity: number;
  organizer_id: number;
  event_image: string; // URL o path de la imagen del evento (OBLIGATORIA)
  created_at?: Date;
  updated_at?: Date;
}

export interface EventRow {
  event_id: number;
  title: string;
  description: string | null;
  event_date: Date;
  duration: number; // Duration in minutes
  status: "upcoming" | "in_progress" | "completed";
  location: string | null;
  event_type: "academico" | "cultural" | "deportivo";
  capacity: number;
  organizer_id: number;
  event_image: string; // URL o path de la imagen del evento
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

export interface UpdateEventDto extends Partial<CreateEventDto> {}
