export interface Event {
  event_id: number;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  event_type: 'academic' | 'cultural' | 'sports';
  capacity: number;
  organizer_id: number;
  created_at: string;
  updated_at: string;
}

export interface EventData {
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  event_type: 'academic' | 'cultural' | 'sports';
  capacity: number;
  organizer_id: number;
}

export interface EventStats {
  total_events: number;
  active_events: number;
  upcoming_events: number;
  total_participants: number;
}

export interface EventType {
  value: 'academic' | 'cultural' | 'sports';
  label: string;
}

export const EVENT_TYPES: EventType[] = [
  { value: 'academic', label: 'Académico' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'sports', label: 'Deportes' }
];

export const getEventTypeLabel = (type: string): string => {
  const eventType = EVENT_TYPES.find(et => et.value === type);
  return eventType ? eventType.label : type;
};
