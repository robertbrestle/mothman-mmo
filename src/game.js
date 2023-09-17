var io = null;

var players = {};
var intents = ["human", "mothman"];

var startTime, now, then, elapsed;
then = Date.now();
startTime = then;
var tickRate = 1000;

var isStarted = false;

var roundTime = 11;
var roundTimeMax = 60;


function startGameLoop(myIO) {
  if (!isStarted) {
    if (typeof myIO !== 'undefined') {
      io = myIO;
    }
    isStarted = true;
    gameloop();
  }
}

function stopGameLoop() {
  isStarted = false;

  // TODO: fix this causing desyncs

  //roundTime = roundTimeMax;
  //io.emit("reset");

  //players = {};
}

function gameloop() {
  io.fetchSockets()
    .then((sockets) => {
      if (sockets.length > 0 && isStarted) {
        now = Date.now();
        elapsed = now - then;
        if (elapsed > tickRate) {
          then = now - (elapsed % tickRate);

          roundTime--;

          io.emit("time", roundTime);
          /*
          collision();
          movement();
          if(stageVars.end.roundOver) {
              roundOver(now);
          }
          */
          if (roundTime < 0) {
            Object.keys(sockets).forEach(key => {
              let id = players[sockets[key].id];
              sockets[key].emit("result", players[sockets[key].id] == "mothman" ? "You win!" : "You lose!");
            });

            stopGameLoop();
          }
        }
        setImmediate(gameloop, tickRate);
      } else {
        stopGameLoop();
      }
    })
    .catch(console.log);
}

function registration(id, intent) {
  // validate and set intent
  if (intent == null || typeof intent === "undefined" || intents.indexOf(intent) < 0) {
    io.emit("error", "Invalid selection");
    return false;
  }
  else if (typeof players[id] !== "undefined") {
    io.emit("error", "You've already selected your intent as " + players[id]);
    return false;
  }
  else {
    players[id] = intent;
    return true;
  }
}

module.exports = {
  players,
  startGameLoop,
  stopGameLoop,
  registration
};