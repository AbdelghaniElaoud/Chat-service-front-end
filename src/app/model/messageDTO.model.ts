import {Conversation, User} from './message.model';

export interface MessageDTO {
  content: string;
  type: string;
  conversationId: number;
}
