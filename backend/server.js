import express, { json } from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import morgan from "morgan";

const app = express();
const SECRET_KEY = "your-secret-key";

// Middleware
const allowedOrigins = ["http://localhost:5173", "https://daynt-assessment.vercel.app"];

// Use a function to check the origin dynamically
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      // Allow requests with no origin (like mobile apps or curl)
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, 
};

app.use(cors(corsOptions));
app.use(json());
app.use(morgan("dev"));

// Sample user data
const users = [
  { email: "reddyaman77.ar@gmail.com", password: "123456" },
];

// Sample data generator
const generateData = () => {
  const items = [];
  for (let i = 1; i <= 20; i++) {
    const randomDob = new Date(
      new Date().setFullYear(new Date().getFullYear() - Math.floor(Math.random() * 30 + 20))
    ).toISOString().split("T")[0]; // Random DOB in ISO format (YYYY-MM-DD)

    items.push({
      id: i,
      name: `User ${i}`,
      dob: randomDob,
    });
  }
  return items;
};

// Middleware for token authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    jwt.verify(token, SECRET_KEY); // Verify token validity
    next(); // Token is valid, proceed to the next middleware/handler
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

// Temporary in-memory storage for added items
let addedItems = [];

// Root route
// app.get("/", (req, res) => {
//   res.send("Welcome to the API server! Use the endpoints to interact with the API.");
// });

// API endpoint for login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((user) => user.email === email && user.password === password);

  if (user) {
    const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: "1h" });
    return res.json({ token });
  }

  return res.status(401).json({ error: "Invalid credentials" });
});

// API endpoint to return data
app.get("/api/data", authenticateToken, (req, res) => {
  const data = [...generateData(), ...addedItems]; // Combine generated and added items
  res.json(data);
});

// API endpoint to add an item
app.post("/api/data", authenticateToken, (req, res) => {
  const { name, dob } = req.body;
  if (!name || !dob) {
    return res.status(400).json({ error: "Name and DOB are required" });
  }

  const newItem = {
    id: addedItems.length + 21, // Ensure unique IDs
    name,
    dob,
  };

  addedItems.push(newItem); // Add item to the in-memory store
  res.status(201).json(newItem); // Respond with the new item
});

// Error handling for invalid routes
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Error handling for server errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
