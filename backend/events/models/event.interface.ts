export interface EventEntity {
  event_id: number;
  title: string;
  description: string | null;
  event_date: Date;
  duration: number; // Duration in minutes
  status: "upcoming" | "in_progress" | "completed";
  location: string | null;
  event_type: "academic" | "cultural" | "sports";
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
  event_type: "academic" | "cultural" | "sports";
  capacity: number;
}

export interface UpdateEventDto extends Partial<CreateEventDto> {}


