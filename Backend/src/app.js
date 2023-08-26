const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
const signupRoutes = require("./Routes/signup");
const loginRoutes = require("./Routes/login");
const taskRoutes = require("./Routes/tasks");
const userRoutes = require("./Routes/user");
const socketIo = require("socket.io")
const http = require("http")



const corsOptions = {
  origin: "http://localhost:3000"
};

app.use(cors(corsOptions));


const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",  // Replace with the origin of your React app
    methods: ["GET", "POST"],
  },
});
app.set("io", io); 
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle admin notifications
  socket.on("adminNotification", (data) => {
    socket.broadcast.emit("adminNotification", data);
  });

  // Handle task notifications
  socket.on("taskNotification", (data) => {
    socket.broadcast.emit("taskNotification", data);
  });

  // ... Other event handlers ...
});
mongoose
  .connect("mongodb://localhost/Tasks", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((error) => {
    console.error("Database connection error:", error.message);
  });

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task Management App",
      version: "1.0.0",
      description: "API documentation for Task Management App",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
  },
  apis: ["./Routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

app.use("/", signupRoutes);
app.use("/", loginRoutes);
app.use("/", userRoutes);
app.use("/", taskRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware to check database connection before processing requests
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(500).json({ error: "Database not connected" });
  }
  next();
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
