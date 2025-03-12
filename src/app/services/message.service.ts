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

  getContacts(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  constructor(private http: HttpClient) {}

  /*getContacts(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/contacts`);
  }*/

  loadMessagesBetweenUsers(user1Id: any, user2Id: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${user1Id}/${user2Id}`);
  }
}
