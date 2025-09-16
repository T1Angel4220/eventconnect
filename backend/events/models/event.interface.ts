export interface EventEntity {
  event_id: number;
  title: string;
  description: string | null;
  event_date: Date;
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
  location?: string;
  event_type: "academic" | "cultural" | "sports";
  capacity: number;
}

export interface UpdateEventDto extends Partial<CreateEventDto> {}


