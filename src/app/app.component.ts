// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { WebsocketService } from './services/websocket.service';
import { MessageService } from './services/message.service';
import {User} from './model/user.model';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    FormsModule,
    NgIf,
    NgForOf
  ],
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  username: string = '';
  isConnected = false;
  contacts: User[] = [];
  selectedContact: User | null = null;

  constructor(private websocketService: WebsocketService, private messageService: MessageService) {}

  ngOnInit(): void {
    this.websocketService.connectionStatus$.subscribe(connected => {
      this.isConnected = connected;
      if (connected) {
        this.loadContacts();
      }
    });
  }

  connect() {
    this.websocketService.connect(this.username);
  }

  loadContacts() {
    this.messageService.getContacts().subscribe((contacts: User[]) => {
      this.contacts = contacts;
      console.log(contacts)
      if (this.contacts.length === 0) {
        console.log('No users found');
      }
    }, error => {
      console.error('Error fetching contacts:', error);
    });
  }

  selectContact(contact: User) {
    this.selectedContact = contact;
    // Load messages with the selected contact
    // this.loadMessagesBetweenUsers(this.username, contact.username);
  }

  // loadMessagesBetweenUsers(username1: string, username2: string) {
  //   this.messageService.loadMessagesBetweenUsers(username1, username2).subscribe((messages: any[]) => {
  //     // Handle loading messages
  //   });
  // }
}
