interface RecoveryCodeData {
  reset_id: number;
  code: string;
  expires_at: Date;
  created_at: Date;
  user_id?: number;
  used?: boolean;
}

export { RecoveryCodeData };
