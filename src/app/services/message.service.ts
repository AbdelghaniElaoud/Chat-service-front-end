// src/app/services/message.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {User} from '../model/user.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = 'http://localhost:8080/api';
  private apiUrl1 = 'http://localhost:8080/api/messages';

  getContacts(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  constructor(private http: HttpClient) {}

  /*getContacts(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/contacts`);
  }*/

  loadMessagesBetweenUsers(user1Id: number, user2Id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl1}/${user1Id}/${user2Id}`);
  }
}
