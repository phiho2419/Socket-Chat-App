const socket = io();

const acknowledgement = (err) => {
  if (err) {
    return alert(err);
  } else {
    console.log("Đã gửi tin nhắn thành công");
  }
};

document.getElementById("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const message = document.getElementById("form-message").value;
  //gửi mess lên server
  socket.emit("send-message-client-to-server", message, acknowledgement);
});

//nhận mess từ server
socket.on("send-message-server-to-client", (message) => {
  console.log(message);
});

//nhận mess từ server
socket.on("message-server-to-client-connect-recently", (message) => {
  console.log(message);
});

socket.on("server-notify-user-join", (message) => {
  console.log(message);
});

const queryString = location.search;
const infor = Qs.parse(queryString, { ignoreQueryPrefix: true });


socket.emit("join-room-client-to-server",infor)

socket.on("send-userlist-server-to-client", (userList) => {
  document.getElementById("userList").innerHTML = userList.map((value) => 
    `
      <li class="app__item-user">${value.username}</li>
    `
  )
});