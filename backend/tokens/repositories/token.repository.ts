import pool from "@config/db";
import {
  TokenEntity,
  CreateTokenDto,
  UpdateTokenDto,
} from "tokens/models/token.model";

export class TokenRepository {
  findAll = async (): Promise<TokenEntity[]> => {
    const result = await pool.query(
      "SELECT * FROM user_push_tokens ORDER BY created_at DESC",
    );
    return result.rows as TokenEntity[];
  };

  findById = async (tokenID: number): Promise<TokenEntity | null> => {
    const result = await pool.query(
      "SELECT * FROM user_push_tokens WHERE token_id = $1",
      [tokenID],
    );
    return result.rows[0] || null;
  };

  findTokensByUserId = async (userId: number): Promise<TokenEntity[]> => {
    const result = await pool.query(
      "SELECT * FROM user_push_tokens WHERE user_id = $1 ORDER BY created_at DESC",
      [userId],
    );
    return result.rows as TokenEntity[];
  };

  create = async (dto: CreateTokenDto): Promise<TokenEntity> => {
    const result = await pool.query(
      `INSERT INTO user_push_tokens (user_id, token)
       VALUES ($1, $2)
       RETURNING *`,
      [dto.user_id, dto.token],
    );
    return result.rows[0] as TokenEntity;
  };

  update = async (
    dto: UpdateTokenDto,
    tokenID: number,
  ): Promise<TokenEntity | null> => {
    const existingToken = await this.findById(tokenID);
    if (!existingToken) return null;

    const updatedToken = {
      ...existingToken,
      ...dto,
    };

    const result = await pool.query(
      `UPDATE user_push_tokens
       SET user_id = $1, token = $2, updated_at = NOW()
       WHERE token_id = $3
       RETURNING *`,
      [updatedToken.user_id, updatedToken.token, tokenID],
    );
    return result.rows[0] as TokenEntity;
  };

  delete = async (tokenID: number): Promise<void> => {
    await pool.query("DELETE FROM user_push_tokens WHERE user_id = $1", [
      tokenID,
    ]);
  };
}

export const tokenRepository = new TokenRepository();
