const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "cricketTeam.db");
const app = express();

app.use(express.json());

let db = null;

const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server started running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`Database Error is ${error.message}`);
    process.exit(1);
  }
};

initializeDBandServer();

const convertDbObjToResponseObj = (dbObj) => {
  return {
    playerId: dbObj.player_id,
    playerName: dbObj.player_name,
    jerseyNumber: dbObj.jersey_number,
    role: dbObj.role,
  };
};

// 1. GET ALL PLAYERS

app.get("/players/", async (request, response) => {
  const playersQuery = `SELECT * FROM cricket_team;`;

  const playersArray = await db.all(playersQuery);
  response.send(
    playersArray.map((eachPlayer) => convertDbObjToResponseObj(eachPlayer))
  );
});

// 2. POST API

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;

  const addPlayerQuery = `insert into cricket_team(player_name, jersey_number, role)
        values ("${playerName}",${jerseyNumber},"${role}")`;

  await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

// 3. GET PLAYER

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const addPlayerQuery = `select * from cricket_team where player_id = ${playerId}`;

  const playerAdd = await db.get(addPlayerQuery);
  response.send(convertDbObjToResponseObj(playerAdd));
});

// 4. UPDATE PLAYER

app.put("/players/:playerId", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;
  const updateQuery = `
        update cricket_team set
        player_name = "${playerName}",
        jersey_number = ${jerseyNumber},
        role = "${role}" where player_id = ${playerId}
    `;

  await db.run(updateQuery);
  response.send("Player Details Updated");
});

// 5. DELETE PLAYER API

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const deletePlayerQuery = `delete from cricket_team where player_id = ${playerId}`;

  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
