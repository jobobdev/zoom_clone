const socket = io(); //io function will automatically find the server that socket.io is running on => this connects the socket.io to the front-end

const welcom = document.getElementById("welcome");
const form = document.querySelector("form");

function backendDone(msg) {
  console.log("The Backend Says:", msg);
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", input.value, backendDone);
  input.value = "";
}
//socket.emit can emit any event(here we named 'enter_room') we want. and we can even send JSON directly to the server. and the third argument is the callback function we can call from our SERVER, that is on the front-end!!! In this case the function called done() set in the backend will be triggerd here.
//in socket.emit, you can send several arguments you want to. you can send anything.
//if you want to send the function to be executed, it has to be the last object.
form.addEventListener("submit", handleRoomSubmit);
