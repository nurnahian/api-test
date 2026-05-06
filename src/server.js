const express = require("express");
const client = require("prom-client");
const responseTime = require("response-time");

const app = express();
const PORT = 3000;

const collectDefaultMetrics = client.collectDefaultMetrics;

collectDefaultMetrics({ register: client.register });

const reqResTime = new client.Histogram({
  name: "http_express_req_res_time",
  help: "This tells how much time is taken by req and res",
  labelNames: ["methode", "route", "status"],
  buckets: [1, 50, 100, 200, 400, 500, 800, 1000, 2000],
});

const totalReqCounter = new client.Counter({
  name: "total_req",
  help: "Tells total req",
});
// Middleware
app.use(
  responseTime((req, res, time) => {
    totalReqCounter.inc();
    reqResTime
      .labels({
        methode: req.method,
        route: req.url,
        status: req.statusCode,
      })
      .observe(time);
  }),
);

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
  res.send("Express Fast & Slow API");
});

// prometheus log collection
app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", client.register.contentType);
  const metrics = await client.register.metrics();
  res.send(metrics);
});
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📍 Fast API: http://localhost:${PORT}/api/fast`);
  console.log(`📍 Slow API: http://localhost:${PORT}/api/slow`);
});
