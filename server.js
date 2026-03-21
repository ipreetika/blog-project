const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
const SECRET = "mysecretkey";
function auth(req, res, next) {
  const header = req.headers["authorization"];

  if (!header) return res.status(401).json({ message: "No token" });

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

// Middleware
app.use(express.json());
app.use(express.static("public"));

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/blogDB")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// =====================
// MODELS
// =====================

// Blog Post Model
const PostSchema = new mongoose.Schema({
  title: String,
  content: String
});
const Post = mongoose.model("Post", PostSchema);

// User Model
const UserSchema = new mongoose.Schema({
  username: String,
  password: String
});
const User = mongoose.model("User", UserSchema);

// =====================
// AUTH ROUTES
// =====================

// Signup
app.post("/signup", async (req, res) => {
  const hashed = await bcrypt.hash(req.body.password, 10);

  const user = new User({
    username: req.body.username,
    password: hashed
  });

  await user.save();
  res.json({ message: "User created" });
});

// Login
app.post("/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });

  if (!user) return res.json({ message: "User not found" });

  const valid = await bcrypt.compare(req.body.password, user.password);

  if (!valid) return res.json({ message: "Wrong password" });

  const token = jwt.sign({ id: user._id }, SECRET);

  res.json({ token });
});

// =====================
// BLOG ROUTES
// =====================

// Get posts
app.get("/posts", async (req, res) => {
  const posts = await Post.find();
  res.json(posts);
});

// Create post
app.post("/posts", auth, async (req, res) => {
  const newPost = new Post(req.body);
  await newPost.save();
  res.json({ message: "Post saved" });
});

// Update post
app.put("/posts/:id", auth, async (req, res) => {
  await Post.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: "Post updated" });
});

// Delete post
app.delete("/posts/:id", auth, async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: "Post deleted" });
});
function auth(req, res, next) {
  console.log("AUTH CHECK"); // 👈 ADD THIS

  const header = req.headers["authorization"];

  if (!header) return res.status(401).json({ message: "No token" });

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}
// =====================

app.listen(3000, () => {
  console.log("Running on http://localhost:3000");
});