const express = require('express');
const app = express();
const socketio = require('socket.io');

const namespaces = require("./data/namespaces");
app.use(express.static(__dirname + '/public'));

const server = app.listen(9000);

const io = socketio(server);

// from github I modified

io.on('connect', (socket) => {
    // build an array to send back with img and endpoint for each NS
    const ns = namespaces.map((namespace) => {
      return {
        img: namespace.img,
        endpoint: namespace.endpoint,
      };
    });
    // send the nsData back to the client , we need to use the socket, NOT io, because we want it to
    // go to just this client
    socket.emit("nsList",ns);
});

// loop through NS and listen for a connection

namespaces.forEach(namespace => {
    io.of(namespace.endpoint).on("connection", (nsSocket)=> {
        // console.log(`${nsSocket.id} has joined ${namespace.endpoint}`)
        const {name} = nsSocket.handshake.query;
        nsSocket.emit("nsRoomLoad", namespace);
        nsSocket.on("joinRoom", async (roomtoJoin) => {
            // console.log("room joined ", room)
            // deal with history once we have it...
            const roomToLeave = Array.from(nsSocket.rooms)[1];
            await nsSocket.leave(roomToLeave);
            await updateRoom(namespace, roomToLeave);
            await nsSocket.join(roomtoJoin);
            // console.log("Rooms ===> ",nsSocket.rooms);
            // const clients = await io.of(namespace.endpoint).in(roomtoJoin).allSockets();
            // console.log(clients.size);
            // callback(clients.size);
            const nsRoom = namespace.rooms.find(room => room.roomTitle === roomtoJoin);
            // console.log(nsRoom);
            nsSocket.emit("historyCatchup", nsRoom?.history);
            // send all users the number of users
            await updateRoom(namespace, roomtoJoin)
        });
        nsSocket.on("newMessageToServer", data => {
            const fullMsg = {
                text: data.message,
                time: Date.now(),
                userName: name,
                avatar: "https://via.placeholder.com/30"
            }
            // console.log(fullMsg);
            // send this msg to all the sockets that are in the room that this socket is in
            // how can we find out what rooms this socket is in?
            const roomTitle = Array.from(nsSocket.rooms)[1];
            const room = namespace.rooms.find(room => room.roomTitle === roomTitle);
            room.addMessage(fullMsg);
            // console.log(room);
            io.of(namespace.endpoint).to(roomTitle).emit("messageToClients", fullMsg);
        })
        nsSocket.on("disconnect", (reason) => {
            // console.log("client disconnected ", reason);
            io.emit("roomDisconnected");
        })
    });

    async function updateRoom(namespace, roomToLeaveOrJoin) {
        const clients = await io.of(namespace.endpoint).in(roomToLeaveOrJoin).allSockets();
        io.of(namespace.endpoint).in(roomToLeaveOrJoin).emit("updateMembers", clients.size);
    }
})
