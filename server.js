const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("./models/User");

const app = express();
const SECRET = "mysecretkey";
function auth(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) return res.status(401).json({ message: "No token" });

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

const MONGO_URL = "mongodb+srv://ipreetika78:Mongo78atlas@blog-cluster.zipgxjv.mongodb.net/blog?retryWrites=true&w=majority";
mongoose.connect(MONGO_URL)
.then(() => {
  console.log("✅ MongoDB CONNECTED SUCCESSFULLY");
})
.catch((err) => {
  console.log("❌ MongoDB CONNECTION ERROR:");
  console.log(err);
});
// MODELS
// =====================

// Blog Post Model
const PostSchema = new mongoose.Schema({
  title: String,
  content: String
});
const Post = mongoose.model("Post", PostSchema);
// ====================
// ROUTES
// ====================

// GET all posts
app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// User Model
const UserSchema = new mongoose.Schema({
  username: String,
  password: String
});
const User = mongoose.model("User", UserSchema);
// SIGNUP
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    username,
    password: hashedPassword
  });

  await user.save();

  res.json({ message: "User created" });
});
// LOGIN
app.post("/login", async (req, res) => {
  try {
    console.log("BODY:", req.body);  // 👈 ADD THIS

    const { username, password } = req.body;

    const user = await User.findOne({ username });

    console.log("USER:", user); // 👈 ADD THIS

    if (!user) {
      return res.json({ message: "User not found" });
    }

    if (user.password !== password) {
      return res.json({ message: "Invalid password" });
    }

    const token = "dummy-token";

    res.json({ token });

  } catch (err) {
    console.log("❌ LOGIN ERROR FULL:", err); // 👈 IMPORTANT
    res.json({ message: "Server error" });
  }
});

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
app.post("/posts", async (req, res) => {
 const { title, content } = req.body;
const newPost = new Post({ title, content });
  await newPost.save();
  res.json({ message: "Post saved" });
});

// Delete post
app.delete("/posts/:id", async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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