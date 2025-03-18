// src/app/model/message.model.ts
export interface Message {
  id: number;
  content: string;
  type: string;
  sender: User;
  recipient: User;
  conversation: Conversation;
  timestamp: Date;
}

export class User {
  constructor(public id: number, public username: string) {}
}

export class Conversation {
  constructor(public sender: User, public receiver: User) {}
}
