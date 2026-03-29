require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();


// MIDDLEWARE
app.use(express.json());
app.use(cors()); // IMPORTANT for frontend


// CONFIG
const SECRET = "mysecretkey";

const ADMIN_EMAIL = "vk623935@gmail.com";
const ADMIN_PASSWORD = "a3c2e47c";


// MONGODB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB CONNECTED"))
  .catch(err => {
    console.error("❌ MONGO FAILED:", err.message);
    process.exit(1);
  });

// MODEL
const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  image: String,

  // 👍 Likes
  likes: {
    type: Number,
    default: 0
  },

  // 💬 Comments
  comments: [
    {
      text: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Post = mongoose.model("Post", PostSchema);

// AUTH MIDDLEWARE
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

// ROUTES

// 🔐 ADMIN LOGIN
app.post("/admin/login", (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: "admin" }, SECRET, { expiresIn: "1d" });
    return res.json({ token });
  }

  res.status(401).json({ message: "Invalid credentials" });
});

// PUBLIC ROUTES

// Get all posts
app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch {
    res.status(500).json({ message: "Error fetching posts" });
  }
});

// Get single post
app.get("/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.json(post);
  } catch {
    res.status(500).json({ message: "Error fetching post" });
  }
});

// ADMIN ROUTES

// Create post
app.post("/posts", async (req, res) => {
  try {
    const { title, content, image } = req.body;

    const newPost = new Post({
      title,
      content,
      image
    });

    await newPost.save();
    res.json({ message: "Post saved" });
  } catch {
    res.status(500).json({ message: "Error creating post" });
  }
});

// Update post
app.put("/posts/:id", auth, async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Post updated" });
  } catch {
    res.status(500).json({ message: "Error updating post" });
  }
});

// Delete post
app.delete("/posts/:id", auth, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted" });
  } catch {
    res.status(500).json({ message: "Error deleting post" });
  }
});

// LIKE ROUTE
app.post("/posts/:id/like", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    res.json(post);
  } catch {
    res.status(500).json({ message: "Error liking post" });
  }
});


// COMMENT ROUTE
app.post("/posts/:id/comment", async (req, res) => {
  try {
    const { text } = req.body;

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { text } } },
      { new: true }
    );

    res.json(post);
  } catch {
    res.status(500).json({ message: "Error adding comment" });
  }
});


// STATIC FILE
app.use(express.static("public"));

// SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});