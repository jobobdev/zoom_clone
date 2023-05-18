import http from "http";
// import WebSocket from "ws";

import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app); //this gives me the server
const ioServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});
instrument(ioServer, {
  auth: false,
  mode: "development",
});

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = ioServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRoom(roomName) {
  return ioServer.sockets.adapter.rooms.get(roomName)?.size;
}

ioServer.on("connection", (socket) => {
  socket["nickname"] = "Anonymous";
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });
  socket.on("enter_room", (roomName, roomCreated) => {
    socket.join(roomName);
    roomCreated();
    socket
      .to(roomName)
      .emit("welcome event", socket.nickname, countRoom(roomName));
    ioServer.sockets.emit("room_change", publicRooms());
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
    );
  });
  socket.on("disconnect", () => {
    ioServer.sockets.emit("room_change", publicRooms());
  });
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });
  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});
//done() does not run the backendDone() function at the backend. instead, it is just like pressing 'play' button that triggers backendDone() to be executed in the front-end.
//and the done() can even send the argument.

/*
?*
const wss = new WebSocket.Server({ server }); //creates websocket server on top of the http server. this allows the port can handle both the http:// and the ws://

const sockets = [];

wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "Anonymous";
  console.log("connected to browser ✅");
  socket.on("close", () => console.log("Disconnected from the Browser ❌")); //when the browser tab is closed.
  socket.on("message", (msg) => {
    const message = JSON.parse(msg);
    switch (message.type) {
      case "new_message":
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname}: ${message.payload}`)
        );
      case "nickname":
        socket["nickname"] = message.payload;
    }
  }); //listener for the message from the browser
}); //this send 'message' to the socket

//wss.on waits the event to happen, then the function is called. also it gives us the info of someone who just connected to our backend which is through the 'socket'.
*/
const handlelisten = () => console.log(`Listeneing on http://localhost:9000`); //express handles http
httpServer.listen(9000, handlelisten);
