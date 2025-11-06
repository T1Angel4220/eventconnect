import {
  CreateTokenDto,
  TokenEntity,
  UpdateTokenDto,
} from "tokens/models/token.model";
import {
  tokenRepository,
  TokenRepository,
} from "tokens/repositories/token.repository";

export class TokenService {
  constructor(private repo: TokenRepository) {}

  getAll = async (): Promise<TokenEntity[]> => {
    const tokens = await this.repo.findAll();
    return tokens as TokenEntity[];
  };

  getById = async (tokenID: number): Promise<TokenEntity | null> => {
    const event = await this.repo.findById(tokenID);
    if (!event) return null;

    return event as TokenEntity;
  };

  create = async (dto: CreateTokenDto): Promise<TokenEntity> => {
    if (!dto.user_id) {
      throw new Error("El ID del usuario es requerido");
    }

    if (!dto.token) {
      throw new Error("El token es requerido");
    }

    console.log("🔍 Validación de datos completada:", dto);
    return this.repo.create(dto);
  };

  async update(
    tokenID: number,
    dto: UpdateTokenDto,
  ): Promise<TokenEntity | null> {
    return this.repo.update(dto, tokenID);
  }

  async remove(tokenID: number): Promise<void> {
    await this.repo.delete(tokenID);
  }
}

export const tokenService = new TokenService(tokenRepository);
