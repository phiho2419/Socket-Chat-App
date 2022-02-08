const express = require("express");
const FilterBadWords = require("bad-words");
const path = require("path");
const { createServer } = require("http");
const { Server } = require("socket.io");
const {
  addUser,
  getListUserByRoom,
  getUserById,
  removeUser,
} = require("./models/user");
const { generateMessage } = require("../public/utils/generate-message");
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  /* options */
});

io.on("connection", (socket) => {
  console.log("new client just connect", socket.id);
  socket.on("join-room-client-to-server", (info) => {
    const { username, room } = info;
    socket.join(room);

    //add user to userList
    const newUser = { id: socket.id, username, room };
    addUser(newUser);

    //su ly cau chao
    //1: user vua ket noi vao: chao mung den voi cybersoft
    //2: cac user da ket noi truoc do: co 1 user moi vua ket noi
    // broadcast se giup gui thong bao cho tat ca user cu tru thang moi vao
    socket.emit(
      "send-message-server-to-client",
      generateMessage("ADMIN", `Welcome user ${username} to join room ${room}`)
    );
    socket.broadcast
      .to(room)
      .emit(
        "send-message-server-to-client",
        generateMessage(`${username} mới vào phòng chat`)
      );

    //receive message from client
    socket.on("send-message-client-to-server", (message, callback) => {
      //check message is valid or not
      const filterBadWords = new FilterBadWords();
      if (filterBadWords.isProfane(message)) {
        return callback("message co tu khong phu hop");
      }

      const { username } = getUserById(socket.id);
      io.to(room).emit(
        "send-message-server-to-client",
        generateMessage(username, message)
      );

      //xu ly gui tin nhan thanh cong
      callback();
    });

    //return userList by room to client
    const userList = getListUserByRoom(room);
    io.to(room).emit("send-user-list-by-room-server-to-client", userList);

    //get location from client
    socket.on("share-location-client-to-server", (location) => {
      const { longitude, latitude } = location;
      const { username } = getUserById(socket.id);
      const urlLocation = `https://www.google.com/maps?q=${latitude},${longitude}`;
      io.to(room).emit(
        "share-location-server-to-client",
        generateMessage(username, urlLocation)
      );
    });
  });

  socket.on(
    "disconnect",
    () => {
      removeUser(socket.id);
      socket.emit(
        "send-message-server-to-client",
        `client ${socket.id} just disconnect`
      );
    }
    // console.log(`client ${socket.id} just disconnect`);
  );
});

// http://localhost:5000/ <==> public
const pathPublicDirectory = path.join(__dirname, "../public");
app.use(express.static(pathPublicDirectory));

const port = 5000;
httpServer.listen(port, () => {
  console.log("run on port " + port);
});
