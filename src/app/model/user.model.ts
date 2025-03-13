export interface User {
  id: number;
  username: string;
  email: string;
}
export class User {
  constructor(public id: number, public username: string) {}
}
