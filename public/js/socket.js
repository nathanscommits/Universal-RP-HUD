const socket = io("ws://localhost:8000");

const PLAYERSTRING = document
  .getElementById("socket")
  .getAttribute("data-player");
const PLAYER = JSON.parse(PLAYERSTRING);
// socket.on("message", (text) => {
//   const el = document.createElement("li");
//   el.innerHTML = text;
//   document.querySelector("ul").appendChild(el);
// });

// document.querySelector("button").onclick = () => {
//   const text = document.querySelector("input").value;
//   socket.emit("message", text);