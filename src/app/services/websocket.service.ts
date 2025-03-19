import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { Conversation } from '../model/conversation.model';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private stompClient: Client | null = null;
  private messageSubject = new BehaviorSubject<any>("default value");
  public messages$ = this.messageSubject.asObservable();
  private connectionSubject = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionSubject.asObservable();
  public conversations: any[] | undefined;

  constructor(private http: HttpClient) {}

  connect(username: string) {
    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => console.log(str)
    });

    this.stompClient.onConnect = (frame) => {
      console.log('Connected to WebSocket server');
      this.connectionSubject.next(true);

      const privateDestination = `/user/${username}/messages`;
      this.stompClient?.subscribe(privateDestination, (message: Message) => {
        const receivedMessage = JSON.parse(message.body);
        console.log('Received private message:', receivedMessage);
        this.messageSubject.next(receivedMessage); // Update the messageSubject
      });

      this.stompClient?.publish({
        destination: '/app/chat.addUser',
        body: JSON.stringify({ sender: username, type: 'JOIN' })
      });
    };

    this.stompClient.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    this.stompClient?.activate();
  }

  loadConversations(username: string): void {
    this.http.get<Conversation[]>(`http://localhost:8080/api/conversations/${username}/conversations`)
      .pipe(map((conversations => conversations)))
      .subscribe(
        conversations => {
          this.conversations = conversations;
        },
        error => console.error('Error loading conversations:', error)
      );
  }

  sendMessage(username: string, content: string, recipient: number, conversation: any) {
    if (this.stompClient && this.stompClient.connected) {
      console.log("************", conversation)
      const chatMessage = { sender: username, content: content, type: 'CHAT', recipient: recipient, conversation:conversation };
      console.log(`Message sent by ${username}: ${content}`);
      this.stompClient.publish({
        destination: `/app/chat.sendMessage`,
        body: JSON.stringify(chatMessage)
      });
    } else {
      console.error('WebSocket is not connected. Unable to send message.');
    }
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
  }
}
