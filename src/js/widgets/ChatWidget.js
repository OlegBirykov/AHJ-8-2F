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
    };
  }

  static get markup() {
    return `
      <div class="${this.classes.widget} hidden">
        <p>Я - самый офигительный в мире чат!</p>
      </div>
    `;
  }

  bindToDOM() {
    this.widget = document.createElement('div');
    this.widget.className = this.classes.widget;
    this.widget.innerHTML = this.constructor.markup;

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

    this.ws.addEventListener('message', (/* evt */) => {
    //  console.log(evt);
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

    this.ws.send(JSON.stringify({
      event: 'connect',
      name,
    }));
  }
}
