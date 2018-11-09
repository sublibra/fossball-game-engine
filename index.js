const configuration = require('./config.js');
const mysql = require('mysql');

const GAME_INIT=0;
const GAME_STARTED=1;
const GAME_END=2;
const BUTTON_CANCEL=4;

// Team 1
const BUTTON_RED=0;
const BUTTON_GREEN=1;

// Team 2
const BUTTON_YELLOW=2;
const BUTTON_BLUE=3;

let players = [];
let mode = 0;
let gameID;

let mysqlConnection;

const connectToDatabase = () => {
  mysqlConnection = mysql.createConnection({
    host: configuration.mysql_host,
    user: configuration.mysql_user,
    password: configuration.mysql_password,
    database: configuration.mysql_database,
  });
  
  mysqlConnection.connect((err) => {
    if (err) {
      console.log(`Not connected: ${err}`);
      return;
    }
    console.log("Connected to database");  
  });
}

const assignPlayer = (playerNumber, ID) => {
  // Wait for card input (or cancel)
  players[playerNumber] = ID;
  console.log(`Assigned player ${playerNumber} to ${ID}`); 
  // TODO Send notification to UI
}

const setupGame = () => {
  mode = GAME_INIT;
  console.log("= Setup new game =");

  // Assign player 1
  assignPlayer(BUTTON_RED,"ID1"); 
  assignPlayer(BUTTON_GREEN,"ID2");
  assignPlayer(BUTTON_YELLOW,"ID3");
  assignPlayer(BUTTON_BLUE,"ID4");

  // Get/Set gameID
  gameID = 256;

}

const waitForButtonInput = () => {
  // return random player goal for testing purpose
  let player = Math.floor( (Math.random() * 10) % 4 ) 
  return player;
}

const reportScore = (gameID, playerID) => {
  let date = new Date().toISOString().slice(0, 19).replace('T', ' ');
  let sql = `INSERT INTO scores VALUES (${gameID}, ${playerID}, '${date}')`;
  console.log(sql);
  mysqlConnection.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
  });
}

const shouldPlayersSwitchSide = ([team1,team2]) => {
  // Reassign player ids
  if (team1 === 5){
    const red = players[BUTTON_RED];
    players[BUTTON_RED] = players[BUTTON_GREEN];
    players[BUTTON_GREEN] = red;
    return;
  } 
  if (team2 === 5){
    const yellow = players[BUTTON_YELLOW];
    players[BUTTON_YELLOW] = players[BUTTON_BLUE];
    players[BUTTON_BLUE] = red;
    return;

  }
  //red->green .... [team 1, team 2]
}

const startGame = () => {
  mode = GAME_END;
  console.log("= Start new game =");
  let score = [0,0];
  let button;

  // Wait for button scores or the cancel button for quitting the game
  // The players are not allowed to move during the game (fix later)
  while (score[0] < 10 && score[1] < 10 && button != BUTTON_CANCEL){
    shouldPlayersSwitchSide(score);
    button = waitForButtonInput();
    switch (button){
      case BUTTON_CANCEL:
        console.log("Cancelling game");
        break;
      case BUTTON_RED:
        console.log(`Red scored`);
        score[0]++;
        reportScore(gameID, button)
        break;
      case BUTTON_GREEN:
        console.log(`Green scored`);
        score[0]++;
        reportScore(gameID, button)
        break;
      case BUTTON_BLUE:
        console.log(`Blue scored`);
        score[1]++;
        reportScore(gameID, button)
        break;
      case BUTTON_YELLOW:
        console.log(`Yellow scored`);
        score[1]++;
        reportScore(gameID, button)
        break;
    }
    console.log(`Score: ${score[0]}:${score[1]}`);
  }
  
}

const endGame = () => {
  mode = GAME_END;
  console.log("= End game =");

}

connectToDatabase();

setupGame();
startGame();
endGame();



