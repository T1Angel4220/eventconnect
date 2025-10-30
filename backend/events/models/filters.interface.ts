export interface EventFilters {
  dateRange?: "today" | "this_week" | "this_month" | "custom";
  startDate?: string;
  endDate?: string;

  location?: string;
  eventType?: "academico" | "cultural" | "deportivo";
  status?: "upcoming" | "in_progress" | "completed";

  sortBy?: "date" | "popularity" | "created_at";
  sortOrder?: "asc" | "desc";
}
