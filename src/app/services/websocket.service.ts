import {Client, Message} from '@stomp/stompjs';
import {BehaviorSubject} from 'rxjs';
import {Injectable} from '@angular/core';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  stompClient: Client | null = null;
  private messageSubject = new BehaviorSubject<any>("default value");
  public messages$ = this.messageSubject.asObservable();
  private connectionSubject = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionSubject.asObservable();

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

  sendMessage(username: string, content: string, recipient: string) {
    if (this.stompClient && this.stompClient.connected) {
      const chatMessage = { sender: username, content: content, type: 'CHAT', recipient: recipient };
      console.log(`Message sent by ${username}: ${content}`);
      this.stompClient.publish({
        destination: '/app/chat.sendMessage',
        headers: { 'recipientUsername': recipient },
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
