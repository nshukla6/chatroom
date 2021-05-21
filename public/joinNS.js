const form = document.querySelector(".message-form");
const message = document.getElementById("user-message");
const messagesPlaceholder = document.getElementById("messages");
function joinNS(endpoint) {
  if (nsSocket) {
    nsSocket.close();
  }
  nsSocket = io(`http://localhost:9000${endpoint}`);
  nsSocket.on("nsRoomLoad", (data) => {
    const rooms = data.rooms;
    console.log(rooms);
    const roomList = document.querySelector(".room-list");
    roomList.innerHTML = "";
    rooms.forEach((room) => {
      const glyph = room.privateRoom ? "lock" : "globe";
      roomList.innerHTML += `<li class="room"><span class="glyphicon glyphicon-${glyph}">${room.roomTitle}</span></li>`;
    });
    // add click listener to each room
    const roomNodes = document.querySelectorAll(".room");
    roomNodes.forEach((node) => {
      node.addEventListener("click", function (e) {
        console.log(node);
        joinRoom(node.firstChild.textContent)
      });
    });
    // add room automatically ... first time here
    const topRoom = document.querySelector(".room");
    joinRoom(topRoom.textContent);
  });

  nsSocket.on("messageToClients", (data) => {
    console.log(data);
    messagesPlaceholder.innerHTML += buildHTML(data);
  });
}

form.addEventListener("submit", messageFormHandler);
  function messageFormHandler(event) {
    event.preventDefault();
    const text = message.value;
    message.value = "";
    nsSocket.emit("newMessageToServer", { message: text });
  }

function buildHTML(msg) {
  const { text, time, avatar, userName } = msg;
  const timestamp = new Date(time).toLocaleString();
  const newHTML = `
              <li>
                <div class="user-image">
                    <img src=${avatar} />
                </div>
                <div class="user-message">
                    <div class="user-name-time">${userName}<span>${timestamp}</span></div>
                    <div class="message-text">${text}</div>
                </div>
              </li>
  `;
  return newHTML;
}
