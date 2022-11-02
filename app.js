const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const cors = require("cors");
app.use(cors({ origin: "http://secondlife.com" }));

app.set("views", "views");
app.set("view engine", "ejs");
app.use(express.static("public"));

const server = require("http").createServer(app);
const fightCollection = require("./db").db().collection("fights");
const { InitialFightDetails, startFight, execute } = require("./controllers/combat")
const io = require("socket.io")(server, {
  cors: { origin: "*" },
});
global.io = io
//app.set("socketio", io);
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("locations", (locations) => {
   console.log("locations: ", locations)
  });
  // socket.on("join_combat", (data) => {
  //   console.log("join_combat")
  //   data.nearby.map(person => {
  //     io.emit("JOIN_COMBAT:" + person.uuid, data.data)
  //   })
  // })
  // socket.on("message", (message) => {
  //   console.log(message);
  //   //io.emit('message', `${socket.id.substr(0,2)} said ${message}` );
  // });

  socket.on("INITIAL_FIGHT_DETAILS", (details) => InitialFightDetails(details))
  socket.on("FIGHT_DETAILS", (details) => io.emit("FIGHT_DETAILS:" + details.fight_id, (details)))
  socket.on("START_FIGHT", (details) => startFight(details))
  socket.on("EXECUTE", (details) =>  execute(details))
});

// app.io = io;
const router = require("./router");
app.use("/", router);
module.exports = server;
