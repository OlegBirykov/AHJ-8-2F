import ChatWidget from './widgets/ChatWidget';

const url = 'ws://localhost:7070/ws';

const chat = new ChatWidget(
  document.getElementById('container'),
  url,
);
chat.bindToDOM();
