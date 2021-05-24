import RegistrationForm from './RegistrationForm';
import { outputTime } from '../utils/tools';

export default class ChatWidget {
  constructor(parentEl, url) {
    this.parentEl = parentEl;
    this.url = url;
    this.classes = this.constructor.classes;
    this.name = null;
    this.lastMessageTime = 0;
    this.requestCycle = 60;
  }

  static get classes() {
    return {
      widget: 'chat-widget',
      users: 'users',
      user: 'user',
      userAvatar: 'user-avatar',
      userName: 'user-name',
      chat: 'chat',
      messages: 'messages',
      message: 'message',
      messageTitle: 'message-title',
      messageText: 'message-text',
      form: 'form',
      newMessage: 'new-message',
      error: 'error',
    };
  }

  static get markup() {
    return `
      <div class="${this.classes.users}">
      </div>
      <div class="${this.classes.chat}">
        <div class="${this.classes.messages}">
        </div>
        <form class="${this.classes.form}">
          <input class="${this.classes.newMessage}" name="${this.classes.newMessage}" placeholder="Type your message here" required>
          <p class="${this.classes.error}">
            Нет связи с сервером
          </p>
        </form>
      </div>
    `;
  }

  bindToDOM() {
    this.widget = document.createElement('div');
    this.widget.className = `${this.classes.widget} hidden`;
    this.widget.innerHTML = this.constructor.markup;

    this.users = this.widget.querySelector(`.${this.classes.users}`);
    this.messages = this.widget.querySelector(`.${this.classes.messages}`);
    this.form = this.widget.querySelector(`.${this.classes.form}`);
    this.input = this.widget.querySelector(`.${this.classes.newMessage}`);
    this.error = this.widget.querySelector(`.${this.classes.error}`);

    this.form.addEventListener('submit', (evt) => this.addMessage(evt));
    this.input.addEventListener('change', () => {
      this.input.value = this.input.value.trim();
    });

    this.parentEl.append(this.widget);

    this.registrationForm = new RegistrationForm(
      document.body,
      this.ws,
      (name) => this.registration(name),
    );
    this.registrationForm.bindToDOM();

    this.connect();
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.addEventListener('open', () => {
      this.registrationForm.hideError();
      this.hideError();
      if (this.name) {
        this.registration(this.name);
      }
    });

    this.ws.addEventListener('message', (evt) => {
      const data = JSON.parse(evt.data);
      this.timeout = this.requestCycle;

      switch (data.event) {
        case 'connect':
          this.name = data.name;
          this.showChat();
          this.send({
            event: 'request-messages',
            time: this.lastMessageTime,
          });
          break;

        case 'noconnect':
          if (!this.widget.classList.contains('hidden')) {
            window.location.reload();
          }
          this.registrationForm.showError(`Пользователь ${data.name} уже есть в чате`);
          this.name = null;
          break;

        case 'users':
          this.userListUpdate(data.users);
          break;

        case 'new-message':
          this.send({
            event: 'request-messages',
            time: this.lastMessageTime,
          });
          break;

        case 'messages':
          this.receivingМessages(data.messages);
          break;

        default:
      }
    });

    this.ws.addEventListener('close', () => {
      this.registrationForm.showError('Нет связи с сервером');
      this.showError();
      setTimeout(() => this.connect(), 3000);
    });
  }

  send(req) {
    if (this.ws.readyState !== WebSocket.OPEN) {
      return;
    }
    this.ws.send(JSON.stringify(req));
  }

  registration(name) {
    this.name = name;
    this.send({
      event: 'connect',
      name,
    });
  }

  showChat() {
    this.registrationForm.hide();
    this.widget.classList.remove('hidden');
    this.timeout = this.requestCycle;
    setInterval(() => this.requestTimer(), 1000);
  }

  showError() {
    this.error.classList.remove('hidden');
  }

  hideError() {
    this.error.classList.add('hidden');
  }

  userListUpdate(users) {
    let userList = '';

    users.forEach((name) => {
      userList += `
        <div class="${this.classes.user}">
          <img class="${this.classes.userAvatar}" src="img/avatar.png" width="50" alt="no avatar">
          <p class="${this.classes.userName + (name === this.name ? ' red' : '')}">
            ${name}
          </p>
        </div>
      `;
    });

    this.users.innerHTML = userList;
  }

  addMessage(evt) {
    evt.preventDefault();
    this.send({
      event: 'message',
      text: this.input.value,
    });
    this.input.value = '';
  }

  receivingМessages(messages) {
    messages.forEach(({ name, time, text }) => {
      const message = document.createElement('div');
      message.className = this.classes.message;
      message.innerHTML = `
        <p class="${this.classes.messageTitle + (name === this.name ? ' right red' : '')}">
          ${name}, ${outputTime(time)}
        </p>
        <p class="${this.classes.messageText + (name === this.name ? ' right' : '')}">
        </p>
      `;

      const messageText = message.querySelector(`.${this.classes.messageText}`);
      messageText.innerText = text;

      const autoscroll = this.messages.scrollHeight
        === this.messages.scrollTop + this.messages.clientHeight;

      this.messages.append(message);
      if (autoscroll) {
        this.messages.scrollTop = this.messages.scrollHeight - this.messages.clientHeight;
      }

      this.lastMessageTime = time;
    });
  }

  requestTimer() {
    this.timeout--;
    if (this.timeout) {
      return;
    }

    this.send({
      event: 'request-messages',
      time: this.lastMessageTime,
    });

    this.timeout = this.requestCycle;
  }
}
