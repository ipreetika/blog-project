const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  image: String,

  // ✅ ADD THIS
  likes: {
    type: Number,
    default: 0
  },

  // ✅ ADD THIS
  comments: [
    {
      text: String
    }
  ],

  createdAt: { type: Date, default: Date.now }
});