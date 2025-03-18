import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../model/user.model';
import { Message } from '../model/message.model';
import { Conversation } from '../model/conversation.model';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  private apiUrl = 'http://localhost:8080/api/conversations';
  private apiUrlMessages = 'http://localhost:8080/api/messages';

  constructor(private http: HttpClient) {}

  getContacts(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/contacts`);
  }

  getConversationsForUser(username: string): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/${username}`);
  }

  loadMessagesByConversationId(conversationId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrlMessages}/conversation/${conversationId}`);
  }

  createMessage(message: Message): Observable<Message> {
    return this.http.post<Message>(this.apiUrl, message);
  }
}
