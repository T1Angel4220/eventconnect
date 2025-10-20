export interface TokenEntity {
  id: number;
  user_id: number;
  device_id: string;
  token: string;
}

export interface CreateTokenDto {
  user_id: number;
  token: string;
  device_id: string;
}

export interface UpdateTokenDto extends Partial<CreateTokenDto> {}
