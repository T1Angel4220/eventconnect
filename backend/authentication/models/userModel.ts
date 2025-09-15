import { UserData } from "authentication/models/userData.interface";

class User implements UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  readonly role: string;

  constructor(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.role = "organizer";
  }
}

export default User;
