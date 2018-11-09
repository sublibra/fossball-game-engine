

CREATE TABLE players (
	playerid VARCHAR(20) NOT NULL, 
	name VARCHAR(40)
);

CREATE TABLE games (
	gameid MEDIUMINT NOT NULL AUTO_INCREMENT,
	player1 VARCHAR(20),
	player2 VARCHAR(20),
	player3 VARCHAR(20),
	player4 VARCHAR(20),
	started DATETIME,
	PRIMARY KEY (gameid)
);

CREATE TABLE scores (
	gameid MEDIUMINT,
	playerid VARCHAR(20),
	timestamp DATETIME
);

	