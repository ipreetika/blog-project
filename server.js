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


// MongoDB connection

const MONGO_URL = "mongodb://mongo:BzMHaoDieiIgCYzswSfPioYJNdisvkfH@crossover.proxy.rlwy.net:29186?authSource=admin&directConnection=true";

mongoose.connect(MONGO_URL)
  .then(() => console.log("✅ MongoDB CONNECTED SUCCESSFULLY"))
  .catch(err => {
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
//signup
app.post("/signup", async (req, res) => {
    console.log("Signup HIT");   // 👈 ADD THIS

    try {
        const { username, password } = req.body;

        const hashed = await bcrypt.hash(password, 10);

        const user = new User({ username, password: hashed });
        await user.save();

        res.json({ message: "Signup successful" });

    } catch (err) {
        console.log(err);
        res.json({ message: "Signup error" });
    }
});
// LOGIN
app.post("/login", async (req, res) => {
    console.log("BODY:", req.body);   // 👈 ADD THIS

    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (!user) return res.json({ message: "User not found" });

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) return res.json({ message: "Invalid password" });

        res.json({ message: "Login successful" });
      

    } catch (err) {
        console.log("ERROR:", err);   // 👈 ADD THIS
        res.json({ message: "Server error" });
    }
});

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

app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
});