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
  socket.emit("players", Object.keys(game.players).length); // send to player
  
  socket.on("registration", (intent) => {
    // attempt to start the game
    game.startGameLoop(io);
    // register player
    if (game.registration(socket.id, intent)) {
      console.log(game.players);
      socket.emit("players", Object.keys(game.players).length); // send to players
      socket.broadcast.emit("players", Object.keys(game.players).length); // send to room
    }
  });

  socket.on("disconnect", () => {
    console.log(socket.id + " disconnected");
    delete game.players[socket.id];
    socket.broadcast.emit("players", Object.keys(game.players).length);
  });

});

http.listen(3000, () => {
	console.log('listening on *:3000');
});