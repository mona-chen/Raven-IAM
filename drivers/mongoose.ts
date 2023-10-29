const mongoose = require("mongoose");

// Replace 'your_connection_string' with your actual MongoDB connection string
const mongoURI =
  process.env.MONGODB_URI ?? "mongodb://localhost:27017/raven-iam";

mongoose.connect(mongoURI, {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true,
  //   useCreateIndex: true,
});

const db = mongoose.connection;

db.on("error", (error: Error) => {
  console.error(`MongoDB connection error: ${error}`);
});

db.once("open", () => {
  console.log("Connected to MongoDB");
});

module.exports = mongoose;
