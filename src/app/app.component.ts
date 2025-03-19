import { Component, OnInit } from '@angular/core';
import { User } from './model/user.model';
import { Conversation } from './model/conversation.model';
import { Message } from './model/message.model';
import { FormsModule } from '@angular/forms';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { WebsocketService } from './services/websocket.service';
import { MessageService } from './services/message.service';
import { ConversationService } from './services/conversation.service';
import { UserService } from './services/user.service';
import {Observable} from 'rxjs';

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
  connectedUser: User | undefined;
  recipient: User | undefined;
  isConnected = false;
  contacts: User[] = [];
  selectedRecipientId: number | null = null;
  selectedContact: User | null = null;
  selectedConversation: any = null; // Add this field to hold the selected conversation ID
  messages: Message[] = [];
  messagesForSocket: any[] = [];
  message: string = '';
  id: any = 0;
  conversations: Conversation[] = [];

  constructor(
    private websocketService: WebsocketService,
    private messageService: MessageService,
    private conversationService: ConversationService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    //console.log("Messages that are coming from the database are " + )

    this.websocketService.connectionStatus$.subscribe(connected => {
      this.isConnected = connected;
      if (connected) {
        this.loadConversations();
      }
    });

    this.websocketService.messages$.subscribe(message => {
      if (message) {
        //this.id = message.sender.id;
        //console.log(`Message received from ${JSON.stringify(message)}`);
        this.messagesForSocket.push(message);
        console.log("The websocket messages are : ", this.messagesForSocket)
      }
    });
  }

  connect() {
    if (this.validateName()) {
      this.websocketService.connect(this.username);

    }
  }

  loadConversations() {
    this.conversationService.getConversationsForUser(this.username).subscribe(
      (conversations: Conversation[]) => {
        this.conversations = conversations;
      },
      error => {
        console.error('Error fetching conversations:', error);
      }
    );
  }

  selectConversation(conversation: Conversation) {
    this.selectedConversation = conversation;
    this.selectedRecipientId = conversation.receiver.id;
    this.loadMessagesForConversation(conversation.id);

    //Subscribe to the conversation channel
    this.websocketService.changeSocket(conversation.id, this.username);

  }

  loadMessagesForConversation(conversationId: number) {
    this.conversationService.loadMessagesByConversationId(conversationId).subscribe(
      (messages: Message[]) => {
        this.messages = messages;

        //console.log(`The messages from the database are ${JSON.stringify(messages)}`)
      },
      error => {
        console.error('Error loading messages:', error);
      }
    );
  }

  sendMessage() {
    if (this.selectedConversation && this.selectedRecipientId && this.message) {
      this.websocketService.sendMessage(
        this.username,
        this.message,
        this.selectedRecipientId,
        this.selectedConversation,
        `/user/${this.selectedConversation.id}/messages`
      );
      const sender = {
        id: this.id,
        username: this.username
      };
      const sentMessage = {
        sender: sender,
        content: this.message,
        type: 'CHAT',
        conversation: this.selectedConversation,
        recipientId: this.selectedRecipientId
      };

      const messageToBeSaved = {
        content: this.message,
        type: 'CHAT',
        conversation: this.selectedConversation,
      }

      console.log('Message to be saved ',messageToBeSaved)

      this.messageService.createMessageWithMessageDTO(messageToBeSaved).subscribe(
        (message: Message) => {
          console.log("The message ", message)
        },
        error => {
          console.error('Error saving the message to the database', error);
        }
      );

      console.log(`This is the message that you have sent : ` + sentMessage.sender.username);
      this.messagesForSocket.push(sentMessage);
      this.message = '';
    }
  }

  getAvatarColor(sender: string): string {
    const colors = ['#2196F3', '#32c787', '#00BCD4', '#ff5652', '#ffc107', '#ff85af', '#FF9800'];
    let hash = 0;
    for (let i = 0; i < sender?.length; i++) {
      hash = 31 * hash + sender.charCodeAt(i);
    }
    return colors[Math.abs(hash % colors.length)];
    5 }

  validateName(): boolean {
    const nameElement = document.getElementById("name") as HTMLInputElement;
    const name = nameElement.value;

    if (!name.trim()) {
      alert("Name cannot be empty.");
      return false;
    }

    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(name)) {
      alert("Name must contain only letters and spaces.");
      return false;
    }

    return true;
  }
}
