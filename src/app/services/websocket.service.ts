import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import { BehaviorSubject } from 'rxjs';
import SockJS from 'sockjs-client';
import {User} from '../model/user.model';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  stompClient: Client | null = null;
  private messageSubject = new BehaviorSubject<any>("default value");
  public messages$ = this.messageSubject.asObservable();
  private connectionSubject = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionSubject.asObservable();
  public sender : User | undefined ;
  public recipient : User | undefined ;

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

      this.stompClient?.subscribe('/user/queue/messages', (message: Message) => {
        const receivedMessage = JSON.parse(message.body);
        console.log('Received message:', receivedMessage);
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

  sendMessage(username: string, content: string, recipient: string) {
    console.log("The recipient is : " + recipient)
    if (this.stompClient && this.stompClient.connected) {
      const chatMessage = { sender: username, content: content, type: 'CHAT', recipient: recipient };
      console.log(`Message sent by ${username}: ${content}`);
      this.stompClient.publish({
        destination: '/app/chat.sendMessage',
        headers: { 'recipientUsername': recipient },
        body: JSON.stringify(chatMessage)
      });
      this.sender = new User(0, username);
      this.recipient = new User(0, recipient);
      this.messageSubject.next({
        content: content,
        sender: this.sender,
        recipient: this.recipient,
        type: "CHAT"
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
