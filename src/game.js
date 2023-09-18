var io = null;

var players = {};
var intents = ["human", "mothman"];

var startTime, now, then, elapsed;
then = Date.now();
startTime = then;
var tickRate = 1000;

var isStarted = false;
var isRoundOver = true;

var roundTime = 11;
var roundTimeMax = 11;

function getPlayerCount() {
  return Object.keys(players).length;
}
function removePlayer(id) {
  if (id == null || typeof players[id] === "undefined")
    return;
  delete players[id];
}

function startGameLoop(myIO) {
  if (!isStarted && isRoundOver) {
    if (typeof myIO !== 'undefined') {
      io = myIO;
    }
    isStarted = true;
    isRoundOver = false;
    roundTime = roundTimeMax;
    gameloop();
  }
}

function stopGameLoop() {
  isStarted = false;
  roundTime = roundTimeMax;
  players = {};

  setTimeout(function() {
    io.emit("players", Object.keys(players).length);
    io.emit("time", "waiting");
    io.emit("reset");
    isRoundOver = true;
  }, 10000);
  
  /*
  io.emit("resetTime", 10);
  for (let i = 10; i < 0; i--) {
    console.log(i);
    setTimeout(function() {
      io.emit("resetTime", i);
    }, 1000);
  }
  io.emit("players", Object.keys(players).length);
  io.emit("reset");
  */
}

function gameloop() {
  io.fetchSockets()
    .then((sockets) => {
      if (sockets.length > 0 && Object.keys(players).length > 0 && isStarted) {
        now = Date.now();
        elapsed = now - then;
        if (elapsed > tickRate) {
          then = now - (elapsed % tickRate);

          roundTime--;

          if (roundTime <= 0) {
            Object.keys(sockets).forEach(key => {
              let id = sockets[key].id;
              if (typeof players[id] !== "undefined") {
                // TODO: change to object; add more data
                sockets[key].emit("result", players[id] == "mothman" ? "You win!" : "You lose!");
              }
            });

            io.emit("time", "complete");

            return stopGameLoop();
          }

          io.emit("time", roundTime);
        }
        setImmediate(gameloop, tickRate);
      } else {
        stopGameLoop();
      }
    })
    .catch(console.log);
}

function registration(id, intent) {
  var response = {
    success: false
  };

  if (!isRoundOver) {
    response.message = "Waiting for the next round";
  }
  else
  // validate and set intent
  if (intent == null || typeof intent === "undefined" || intents.indexOf(intent) < 0) {
    response.message = "Invalid intent selection :^)";
  }
  else if (typeof players[id] !== "undefined") {
    response.message = "You've already selected your intent as " + players[id];
  }
  else {
    players[id] = intent;
    response.success = true;
  }

  return response;
}

module.exports = {
  roundTime,
  getPlayerCount,
  removePlayer,
  startGameLoop,
  stopGameLoop,
  registration
};