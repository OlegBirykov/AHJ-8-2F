export default class RegistrationForm {
  constructor(parentEl, ws, callback) {
    this.parentEl = parentEl;
    this.ws = ws;
    this.callback = callback;
    this.classes = this.constructor.classes;
  }

  static get classes() {
    return {
      widget: 'registration-form',
      form: 'form',
      title: 'title',
      name: 'name',
      button: 'continue-button',
      error: 'error',
    };
  }

  static get markup() {
    return `
      <div class="${this.classes.widget}">
        <form class="${this.classes.form}">
          <p class="${this.classes.title}">
            Выберите псевдоним
          </p> 
          <input class="${this.classes.name}" name="${this.classes.name}" required>
          <button class="${this.classes.button}" type="submit">
            Продолжить
          </button>
          <p class="${this.classes.error} hidden">Нет связи с сервером</p>  
        </form>
      </div>
    `;
  }

  bindToDOM() {
    this.widget = document.createElement('div');
    this.widget.className = this.classes.widget;
    this.widget.innerHTML = this.constructor.markup;

    this.form = this.widget.querySelector(`.${this.classes.form}`);
    this.input = this.widget.querySelector(`.${this.classes.name}`);
    this.error = this.widget.querySelector(`.${this.classes.error}`);

    this.form.addEventListener('submit', (evt) => this.registration(evt));
    this.input.addEventListener('change', () => {
      this.input.value = this.input.value.trim();
    });

    this.parentEl.append(this.widget);
  }

  registration(evt) {
    const name = this.input.value;
    if (!name) {
      return;
    }
    evt.preventDefault();
    this.callback(name);
  }

  showError(error) {
    this.error.innerText = error;
    this.error.classList.remove('hidden');
  }

  hideError() {
    this.error.classList.add('hidden');
  }
}
