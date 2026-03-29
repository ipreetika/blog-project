<<<<<<< HEAD
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

// =====================
// CONFIG
// =====================
const SECRET = "mysecretkey";

const ADMIN_EMAIL = "vk623935@gmail.com";
const ADMIN_PASSWORD = "a3c2e47c";

// =====================
// MONGODB
// =====================
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB CONNECTED"))
  .catch(err => console.log(err));

// =====================
// MODEL
// =====================
const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  image: String,
  createdAt: { type: Date, default: Date.now }
});
const Post = mongoose.model("Post", PostSchema);

// =====================
// AUTH MIDDLEWARE
// =====================
function auth(req, res, next) {
  const header = req.headers["authorization"];

  if (!header) return res.status(401).json({ message: "No token" });

  const token = header.split(" ")[1];

  try {
    jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(403).json({ message: "Invalid token" });
  }
}

// =====================
// ROUTES
// =====================

// 🔐 ADMIN LOGIN
app.post("/admin/login", (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: "admin" }, SECRET, { expiresIn: "1d" });
    return res.json({ token });
  }

  res.status(401).json({ message: "Invalid credentials" });
});

// 🌐 PUBLIC ROUTES

// Get all posts
app.get("/posts", async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

// Get single post
app.get("/posts/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.json(post);
});

// 🔒 ADMIN ROUTES

// Create post
app.post("/posts", async (req, res) => {
  const { title, content, image } = req.body;

  const newPost = new Post({
    title,
    content,
    image   // ✅ ADD THIS
  });

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

// =====================
// STATIC FILES
// =====================
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
=======
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

// =====================
// CONFIG
// =====================
const SECRET = "mysecretkey";

const ADMIN_EMAIL = "vk623935@gmail.com";
const ADMIN_PASSWORD = "a3c2e47c";

// =====================
// MONGODB
// =====================
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB CONNECTED"))
  .catch(err => console.log(err));

// =====================
// MODEL
// =====================
const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  image: String,
  createdAt: { type: Date, default: Date.now }
});
const Post = mongoose.model("Post", PostSchema);

// =====================
// AUTH MIDDLEWARE
// =====================
function auth(req, res, next) {
  const header = req.headers["authorization"];

  if (!header) return res.status(401).json({ message: "No token" });

  const token = header.split(" ")[1];

  try {
    jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(403).json({ message: "Invalid token" });
  }
}

// =====================
// ROUTES
// =====================

// 🔐 ADMIN LOGIN
app.post("/admin/login", (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: "admin" }, SECRET, { expiresIn: "1d" });
    return res.json({ token });
  }

  res.status(401).json({ message: "Invalid credentials" });
});

// 🌐 PUBLIC ROUTES

// Get all posts
app.get("/posts", async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

// Get single post
app.get("/posts/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.json(post);
});

// 🔒 ADMIN ROUTES

// Create post
app.post("/posts", async (req, res) => {
  const { title, content, image } = req.body;

  const newPost = new Post({
    title,
    content,
    image   // ✅ ADD THIS
  });

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

// =====================
// STATIC FILES
// =====================
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
>>>>>>> 07182f3f1c28a573ec081165522793d8220aca5c
});