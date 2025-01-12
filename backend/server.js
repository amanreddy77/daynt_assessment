import express, { json } from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import morgan from "morgan";

const app = express();
const SECRET_KEY = "your-secret-key";

// Middleware
app.use(cors({ origin: "http://localhost:5173" })); // Allow your frontend origin
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
// Temporary in-memory storage for added items
let addedItems = [];

// API endpoint to add an item
app.post("/api/data", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    jwt.verify(token, SECRET_KEY); // Verify token validity

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
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
});

// Modify the GET /api/data endpoint to include added items
app.get("/api/data", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    jwt.verify(token, SECRET_KEY); // Verify token validity
    const data = [...generateData(), ...addedItems]; // Combine generated and added items
    res.json(data);
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
});

app.get("/api/data", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    jwt.verify(token, SECRET_KEY); // Verify token validity
    const data = generateData();
    res.json(data);
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
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
