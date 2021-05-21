const search =  document.getElementById("search-box");

function joinRoom(roomName){

    nsSocket.emit("joinRoom", roomName);
    nsSocket.on("historyCatchup", (history) => {
        console.log(history);
        const messagesPlaceholder = document.getElementById("messages");
        messagesPlaceholder.innerHTML = "";
        history?.forEach(history => {
            messagesPlaceholder.innerHTML += buildHTML(history);
        });
        messagesPlaceholder.scrollTo(0,messagesPlaceholder.scrollHeight);
        
    });
    nsSocket.on("updateMembers", liveUsers => {
        console.log("liveRooms", liveUsers);
        const count = document.querySelector(".curr-room-num-users");
        const room = document.querySelector(".curr-room-text");
         count.innerHTML = `${liveUsers} <span class="glyphicon glyphicon-user"></span>`;
         room.innerText = roomName;
    });
    nsSocket.on("roomDisconnected", () => {
        console.log("disconnected")
    })
}

search.addEventListener("input", (e) => {
    const searchTerm = e.target.value;
    const messages = document.querySelectorAll(".message-text");
    // const mArray = messages.map(m => m.textContent);

    messages.forEach(mes => {
        if(mes.textContent.toLowerCase().indexOf(searchTerm.toLowerCase()) === -1){
            mes.style.display='none';
        }else {
            mes.style.display = 'block';
        }
    })
})
