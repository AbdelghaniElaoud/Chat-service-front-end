import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message } from '../model/message.model';
import { User } from '../model/user.model';
import {MessageDTO} from '../model/messageDTO.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = 'http://localhost:8080/api/messages';

  constructor(private http: HttpClient) {}

  getContacts(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/contacts`);
  }

  loadMessagesByConversationId(conversationId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/conversation/${conversationId}`);
  }

  createMessage(message: Message): Observable<Message> {
    return this.http.post<Message>(this.apiUrl, message);
  }

  createMessageWithMessageDTO(message: MessageDTO): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/create`, message);
  }
}
