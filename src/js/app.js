import ChatWidget from './widgets/ChatWidget';

const url = 'wss://ahj-8-2.herokuapp.com/ws';

const chat = new ChatWidget(
  document.getElementById('container'),
  url,
);
chat.bindToDOM();
