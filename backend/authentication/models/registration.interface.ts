export interface RegistrationData {
  registration_id?: number;
  user_id: number;
  event_id: number;
  registered_at?: Date;
  status: 'registered' | 'canceled';
}

export interface RegistrationRow {
  registration_id: number;
  user_id: number;
  event_id: number;
  registered_at: Date;
  status: 'registered' | 'canceled';
}

export interface RegistrationWithDetails extends RegistrationRow {
  user_name: string;
  user_email: string;
  event_title: string;
  event_date: Date;
}

export interface RegistrationStats {
  total_registrations: number;
  active_registrations: number;
  canceled_registrations: number;
}
