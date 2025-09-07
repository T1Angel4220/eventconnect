export interface UserRow {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  created_at: Date;
  password?: string;
}
