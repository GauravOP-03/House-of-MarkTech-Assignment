const express = require("express");
const app = express();

const user = {}; // user = {password, tasks:[]}
const session = {}; //session = {token:{username}}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
function generateToken() {
  return Math.random().toString(36).substring(2, 15);
}
// console.log(generateToken());

const authorization = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token || !session[token]) return res.status(401).json("unauthorized");
  req.username = session[token].username;
  next();
};

app.get("/", (req, res) => {
  return res.status(200).json({ message: "health good" });
});

app.post("/signup", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json("username and password are required");
  if (user[username]) return res.status(400).json("user already exists");
  user[username] = { password, tasks: [] };
  res.status(201).json("user created successfully");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json("username and password are required");
  if (!user[username]) return res.status(400).json("user does not exist");
  if (user[username].password !== password)
    return res.status(400).json("invalid password");
  const token = generateToken();
  session[token] = { username };
  res.status(200).json({ message: "Login Successfully", token });
});

app.post("/task", authorization, (req, res) => {
  const { task } = req.body;
  if (!task) return res.status(400).json("task is required");
  user[req.username].tasks.push(task);
  res.status(201).json("task created successfully");
});

app.get("/task", authorization, (req, res) => {
  const tasks = user[req.username].tasks;
  return res.json(tasks);
});

app.delete("/task", authorization, (req, res) => {
  const { task } = req.body;
  if (!task) return res.status(400).json("task is required");
  const index = user[req.username].tasks.indexOf(task);
  if (index === -1) return res.status(400).json("task does not exist");
  user[req.username].tasks.splice(index, 1);
  res.status(200).json("task deleted successfully");
});

app.get("/logout", authorization, (req, res) => {
  const token = req.headers["authorization"];
  delete session[token];
  res.status(200).json("logout successfully");
});
app.listen(3000, () => {
  console.log("app is listening on port 3000");
});
