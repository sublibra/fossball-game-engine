const configuration = require('./config.js');
const mysql = require('mysql');

// Current game mode
let mode = 0;
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

// [player1, player2, player3, player4] ids (nfc tag)
let players = [];

// Unique game identifier as fetched from the database
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
  assignPlayer(BUTTON_RED,"NFCID 1"); 
  assignPlayer(BUTTON_GREEN,"ID2");
  assignPlayer(BUTTON_YELLOW,"ID3");
  assignPlayer(BUTTON_BLUE,"ID4");

  // Get gameID
  gameID = null;
  let date = new Date().toISOString().slice(0, 19).replace('T', ' ');
  let sql = `INSERT INTO games VALUES (null, '${players[0]}', '${players[1]}', '${players[2]}', '${players[3]}', '${date}')`;
  mysqlConnection.query(sql, (err, result) => {
    if (err) throw err;
    console.log(`New game inserted: `,result.insertId);
    gameID = result.insertId;
  });
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

// After a team has reached a score of five the team members switch sides
// back to forward etc.
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
    players[BUTTON_BLUE] = yellow;
    return;
  }
}

const startGame = () => {
  mode = GAME_STARTED;
  console.log("= Start new game =");
  // [team1 score, team2 score]  (team1 = red and green)
  let score = [0,0];
  let button;

  // Wait for button scores or the cancel button for quitting the game
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

  // Notify UI that the game ended
}

// Application init
connectToDatabase();
while (true){
  setupGame();
  startGame();
  endGame();
}
