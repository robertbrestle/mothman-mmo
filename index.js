var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const game = require('./src/game.js');

app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

io.on("connection", (socket) => {

  console.log(socket.id + " connected");
  socket.emit("players", game.getPlayerCount()); // send to player
  
  socket.on("registration", (intent) => {
    // register player
    let response = game.registration(socket.id, intent);

    if (!response.success) {
      socket.emit("error", response.message);
    }
    else {
      socket.emit("registrationSuccess", intent);

      // attempt to start the game
      game.startGameLoop(io);
      // send updates to clients
      socket.emit("players", game.getPlayerCount()); // send to player
      socket.broadcast.emit("players", game.getPlayerCount()); // send to room
      socket.emit("time", game.getRoundTime()); // send to players
      socket.broadcast.emit("time", game.getRoundTime()); // send to room
    }
  });

  socket.on("disconnect", () => {
    console.log(socket.id + " disconnected");
    game.removePlayer(socket.id);
    socket.broadcast.emit("players", game.getPlayerCount());
  });

});

http.listen(3000, () => {
	console.log('listening on *:3000');
});