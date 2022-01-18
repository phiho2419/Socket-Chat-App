const express = require("express");
const app = express();
const path = require("path");
const port = 4000;
const http = require("http");
const { Server } = require("socket.io");
const FillterBadWords = require("bad-words");
const { addUser, getListUserByRoom } = require('./src/models/user.js')
const pathPublicDir = path.join(__dirname, "./public");
app.use(express.static(pathPublicDir));

const server = http.createServer(app);

const io = new Server(server, {});

io.on("connection", (socket) => {
  //Xử lý join room
  socket.on("join-room-client-to-server", ({ room, username }) => {
    socket.join(room);

    //Thêm user vào danh sách user
    const newUser = {
      id: socket.id,
      room,
      username
    }
    
    addUser(newUser)

    //Chào riêng 1 client
    socket.emit("message-server-to-client-connect-recently", "Wellcome !!!");
    //Thông báo tất cả client trừ user mới vào
    socket.broadcast.to(room).emit("server-notify-user-join", "Có user vừa vào phòng");
    //nhận message từ client
    socket.on("send-message-client-to-server", (message, callback) => {
      //kiểm tra message có hợp lệ
      const fillterBW = new FillterBadWords();
      if (fillterBW.isProfane(message)) {
        return callback("message chứa bad words");
      } else {
        //gửi message từ server
        //callback xử lý gửi tin nhắn thành công
        io.to(room).emit("send-message-server-to-client", message);
        callback();
      }

    });

    //Xử lý trả danh sách người theo phòng về client
    const userList = getListUserByRoom(room);
    io.to(room).emit("send-userlist-server-to-client",userList)
    
  });

  socket.on("disconnect", () => {
    console.log(`client ${socket.id} disconnected`);
  });
});
server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
