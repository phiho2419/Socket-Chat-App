const socket = io();

const acknowledgement = (err) => {
  if (err) {
    return alert(err);
  }
  console.log("đã gửi tin nhắn thành công ");
};

document.getElementById("form-messages").addEventListener("submit", (e) => {
  e.preventDefault();
  const message = document.getElementById("input-messages").value;
  //send message to Server
  socket.emit("send-message-client-to-server", message, acknowledgement);
});

// receive message from Server
socket.on("send-message-server-to-client", (content) => {
  console.log(content);
  document.getElementById("message-list").innerHTML += `
        <div class="message-item">
          <div class="message__row1">
            <p class="message__name">${
              content.username ? content.username : ""
            }</p>
            <p class="message__date">${content.time ? content.time : ""}</p>
          </div>
          <div class="message__row2">
            <p class="message__content">
              ${content.message ? content.message : ""}
            </p>
          </div>
        </div>
  `;
});
//lay query tren thanh url
const queryString = location.search;
const info = Qs.parse(queryString, { ignoreQueryPrefix: true });
socket.emit("join-room-client-to-server", info);

socket.on("send-user-list-by-room-server-to-client", (userList) => {
  document.getElementById("user-list-by-room").innerHTML = userList
    .map((user) => {
      return `<li class="app__item-user">${user.username}</li>`;
    })
    .reduce((sumString, stringHtml) => (sumString += stringHtml), "");
});

//xu ly share location
document.getElementById("btn-share-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    return aler("Trinh duyet khong ho tro");
  }

  navigator.geolocation.getCurrentPosition((position) => {
    const location = {
      longitude: position.coords.longitude,
      latitude: position.coords.latitude,
    };
    socket.emit("share-location-client-to-server", location);
  });
});

socket.on("share-location-server-to-client", (content) => {
  document.getElementById("message-list").innerHTML += `
        <div class="message-item" >
          <div class="message__row1">
            <p class="message__name">${
              content.username ? content.username : ""
            }</p>
            <p class="message__date">${content.time ? content.time : ""}</p>
          </div>
          <div class="message__row2">
            <p class="message__content">
              <a href="${content.message}" target="_blank">${
    content.username ? `${content.username} location` : ""
  }</a>
            </p>
          </div>
        </div>
  `;
});
