const socket = io(); //io function will automatically find the server that socket.io is running on => this connects the socket.io to the front-end

const welcom = document.getElementById("welcome");
const form = document.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;
let roomName = "";

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
}

function showRoom() {
  welcom.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  const msgForm = room.querySelector("#msg");
  const nicknameForm = room.querySelector("#nickname");
  msgForm.addEventListener("submit", handleMessageSubmit);
  nicknameForm.addEventListener("submit", handleNicknameSubmit);
}

function handleNicknameSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#nickname input");
  const value = input.value;
  socket.emit("nickname", value);
  input.value = "";
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
}
//socket.emit can emit any event(here we named 'enter_room') we want. and we can even send JSON directly to the server. and the third argument is the callback function we can call from our SERVER, that is on the front-end!!! In this case the function called done() set in the backend will be triggerd here.
//in socket.emit, you can send several arguments you want to. you can send anything.
//if you want to send the function to be executed, it has to be the last object.
form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome event", (user, newCount) => {
  addMessage(`${user} joined!`);
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
});

socket.on("bye", (left, newCount) => {
  addMessage(`${left} left`);
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}  (${newCount})`;
});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";
  if (rooms.length === 0) {
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
}); //=== socket.on("room_change", (msg) => console.log(msg));
