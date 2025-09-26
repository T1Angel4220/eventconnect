export interface EventResponse {
  event_id: number;
  title: string;
  description: string | null;
  event_date: string; // ISO
  duration: number; // Duration in minutes
  status: "upcoming" | "in_progress" | "completed";
  location: string | null;
  event_type: "academic" | "cultural" | "sports";
  capacity: number;
  organizer_id: number;
  created_at: string;
  updated_at: string;
  attendees?: number;
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  event_date: string; // ISO datetime
  duration: number; // Duration in minutes
  status?: "upcoming" | "in_progress" | "completed"; // Optional, defaults to 'upcoming'
  location?: string;
  event_type: "academic" | "cultural" | "sports";
  capacity: number;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  } as HeadersInit;
}

export async function fetchEvents(): Promise<EventResponse[]> {
  const res = await fetch(`${API_URL}/events`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Error cargando eventos");
  return res.json();
}

export async function createEvent(payload: CreateEventPayload): Promise<EventResponse> {
  const res = await fetch(`${API_URL}/events`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error creando evento");
  return res.json();
}

export async function updateEvent(eventId: number, payload: Partial<CreateEventPayload>): Promise<EventResponse> {
  const res = await fetch(`${API_URL}/events/${eventId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error actualizando evento");
  return res.json();
}

export async function deleteEvent(eventId: number): Promise<void> {
  const res = await fetch(`${API_URL}/events/${eventId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Error eliminando evento");
}

export async function updateEventStatuses(): Promise<{ message: string; updatedCount: number }> {
  const res = await fetch(`${API_URL}/events/status/update`, {
    method: "PUT",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Error actualizando estados");
  return res.json();
}


