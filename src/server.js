import http from "http";
// import WebSocket from "ws";
import { Server } from "socket.io";
import express from "express";
import { Socket } from "dgram";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/ "));

const handlelisten = () => console.log(`Listeneing on http://localhost:3000`); //express handles http

const httpServer = http.createServer(app); //this gives me the server
const ioServer = new Server(httpServer);

ioServer.on("connection", (socket) => {
  socket.on("enter_room", (roomName, done) => {
    console.log(roomName);
    setTimeout(() => {
      done("Yo I am the Backend!");
    }, 10000);
  });
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

httpServer.listen(3000, handlelisten);
