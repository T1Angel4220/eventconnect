import { UserData } from "authentication/models/userData.interface";
import User from "authentication/models/userModel";
import {
  userRepository,
  UserRepository,
} from "authentication/repositories/user.repository";

class UserService {
  constructor(private userModel: UserRepository) {}

  async createUser(userData: UserData) {
    const { firstName, lastName, email, password, role } = userData;
    const newUser: User = new User(firstName, lastName, email, password, role);

    return this.userModel.create(newUser);
  }

  async updateUserPassword(userId: number, newPassword: string) {
    return this.userModel.updatePassword(userId, newPassword);
  }

  async getUserById(userId: number) {
    return this.userModel.findById(userId);
  }

  async getUserByEmail(email: string) {
    return this.userModel.findByEmail(email);
  }
}

export const userService = new UserService(userRepository);
export { UserService };
