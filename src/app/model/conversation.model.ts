// src/app/model/conversation.model.ts
import { User } from './user.model';

export interface Conversation {
  id: number;
  sender: User;
  receiver: User;
  uniqueIdentifier: string;
  createdAt: Date;
}

export class Conversation implements Conversation {
  constructor(public sender: User, public receiver: User) {}
}
