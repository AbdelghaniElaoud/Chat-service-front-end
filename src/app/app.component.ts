// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { WebsocketService } from './services/websocket.service';
import { MessageService } from './services/message.service';
import {User} from './model/user.model';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    NgForOf,
    NgIf,
    NgClass,
    FormsModule
  ],
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  username: string = '';
  isConnected = false;
  contacts: User[] = [];
  selectedContact: User | null = null;
  messages: any[] = [];
  message: string = '';

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
    if (this.validateName()){
      this.websocketService.connect(this.username);
    }
  }

  loadContacts() {
    this.messageService.getContacts().subscribe((contacts: User[]) => {
      this.contacts = contacts;
    }, error => {
      console.error('Error fetching contacts:', error);
    });
  }

  selectContact(contact: User) {
    this.selectedContact = contact;
    this.loadMessagesBetweenUsers(this.username, contact.username);
  }

  loadMessagesBetweenUsers(username1: string, username2: string) {
    const userId1 = this.contacts.find(user => user.username === username1)?.id;
    const userId2 = this.contacts.find(user => user.username === username2)?.id;
    if (userId1 !== undefined && userId2 !== undefined) {
      this.messageService.loadMessagesBetweenUsers(userId1, userId2).subscribe((messages: any[]) => {
        this.messages = messages;
        console.log("Messages : ", JSON.stringify(this.messages, null, 2));
      }, error => {
        console.error('Error loading messages:', error);
      });
    }
  }

  sendMessage() {
    if (this.selectedContact && this.message) {
      this.websocketService.sendMessage(this.username, this.message, this.selectedContact.username);
      this.message = '';
    }
  }

  getAvatarColor(sender: string): string {
    const colors = ['#2196F3', '#32c787', '#00BCD4', '#ff5652', '#ffc107', '#ff85af', '#FF9800', '#39bbb0'];
    let hash = 0;
    for (let i = 0; i < sender?.length; i++) {
      hash = 31 * hash + sender.charCodeAt(i);
    }
    return colors[Math.abs(hash % colors.length)];
  }

   validateName(): boolean {
    const nameElement = document.getElementById("name") as HTMLInputElement;
    const name = nameElement.value;

    // Check if the name is empty or contains only whitespace
    if (!name.trim()) {
      alert("Name cannot be empty.");
      return false;
    }

    // Check if the name contains only letters and spaces
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(name)) {
      alert("Name must contain only letters and spaces.");
      return false;
    }

    return true;
  }

  protected readonly onsubmit = onsubmit;
}
