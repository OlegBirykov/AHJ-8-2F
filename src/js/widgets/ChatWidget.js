import RegistrationForm from './RegistrationForm';

export default class ChatWidget {
  constructor(parentEl, url) {
    this.parentEl = parentEl;
    this.url = url;
    this.classes = this.constructor.classes;
  }

  static get classes() {
    return {
      widget: 'chat-widget',
      users: 'users',
      user: 'user',
      userAvatar: 'user-avatar',
      userName: 'user-name',
      messages: 'messages',
    };
  }

  static get markup() {
    return `
      <div class="${this.classes.users}">
      </div>
      <div class="${this.classes.messages}">
      </div>
    `;
  }

  bindToDOM() {
    this.widget = document.createElement('div');
    this.widget.className = `${this.classes.widget} hidden`;
    this.widget.innerHTML = this.constructor.markup;

    this.users = this.widget.querySelector(`.${this.classes.users}`);
    this.messages = this.widget.querySelector(`.${this.classes.messages}`);

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
    });

    this.ws.addEventListener('message', (evt) => {
      const data = JSON.parse(evt.data);

      switch (data.event) {
        case 'connect':
          this.name = data.name;
          this.showChat();
          break;
        case 'noconnect':
          this.registrationForm.showError(`Пользователь ${data.name} уже есть в чате`);
          break;
        case 'users':
          this.userListUpdate(data.users);
          break;
        default:
      }
    });

    this.ws.addEventListener('close', () => {
      this.registrationForm.showError('Нет связи с сервером');
      setTimeout(() => this.connect(), 3000);
    });

    this.ws.addEventListener('error', () => {

    });
  }

  registration(name) {
    if (this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    this.name = name;
    this.ws.send(JSON.stringify({
      event: 'connect',
      name,
    }));
  }

  showChat() {
    this.registrationForm.hide();
    this.widget.classList.remove('hidden');
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
}
