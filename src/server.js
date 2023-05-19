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
const ioServer = new Server(httpServer);

ioServer.on("connection", (socket) => {
  socket.on("join_room", (roomName) => {
    socket.join(roomName);

    socket.to(roomName).emit("welcome");
  });
  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });
  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
  });
});

const handlelisten = () => console.log(`Listeneing on http://localhost:9000`); //express handles http

httpServer.listen(9000, handlelisten);
