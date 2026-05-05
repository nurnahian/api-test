const express = require("express");
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// ====================== DELAY ARRAY ======================
const delayArray = [1000, 1500, 2500, 3000, 4500, 6000, 8000];
// You can change these values as you want (in milliseconds)

// ====================== FAST API ======================
app.get("/api/fast", (req, res) => {
  res.json({
    status: "success",
    message: "Fast API - Response is quick! ⚡",
    timestamp: new Date().toISOString(),
  });
});

// ====================== SLOW API ======================
app.get("/api/slow", (req, res) => {
  // Pick random delay from array
  
  const randomIndex = Math.floor(Math.random() * delayArray.length);
  const delay = delayArray[randomIndex];

  // 30% chance of error
  const shouldError = Math.random() < 0.3;

  setTimeout(() => {
    if (shouldError) {
      const errorTypes = [
        { status: 500, message: "Internal Server Error" },
        { status: 503, message: "Service Unavailable" },
        { status: 429, message: "Too Many Requests" },
        { status: 504, message: "Gateway Timeout" },
      ];

      const error = errorTypes[Math.floor(Math.random() * errorTypes.length)];

      return res.status(error.status).json({
        status: "error",
        message: error.message,
        delay: `${delay}ms`,
        timestamp: new Date().toISOString(),
      });
    }

    // Success response
    res.json({
      status: "success",
      message: "Slow API - Finally responded! 🐢",
      delay: `${delay}ms`,
      timestamp: new Date().toISOString(),
    });
  }, delay);
});

// Root route
app.get("/", (req, res) => {
  res.send(`
        <h1>Express Fast & Slow API</h1>
        <p>Delay Array: [${delayArray.join(", ")}] ms</p>
        <ul>
            <li><a href="/api/fast">/api/fast</a> → Fast</li>
            <li><a href="/api/slow">/api/slow</a> → Slow (from array)</li>
        </ul>
    `);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📍 Fast API: http://localhost:${PORT}/api/fast`);
  console.log(`📍 Slow API: http://localhost:${PORT}/api/slow`);
});
