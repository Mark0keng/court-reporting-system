import express from "express";
import userApi from "./api/user.js";
import jobApi from "./api/job.js";
import reporterApi from "./api/reporter.js";
import editorApi from "./api/editor.js";
import authApi from "./api/auth.js";
import { requireAuth } from "./middlewares/authMiddleware.js";

const app = express();

// CORS Middleware
app.use((req: any, res: any, next: any) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, trxId, X-Transaction-ID",
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Parser JSON
app.use(express.json());

// Health check endpoint
app.get("/health", (req: any, res: any) => {
  const trxId = req.headers.trxId || "HEALTH";
  res.json({
    status: "ok",
    message: "Express server is running successfully",
    trxId,
    timestamp: new Date().toISOString(),
  });
});

// Registrasi rute API terstruktur
app.use("/api/user", requireAuth, userApi);
app.use("/api/job", requireAuth, jobApi);
app.use("/api/reporter", requireAuth, reporterApi);
app.use("/api/editor", requireAuth, editorApi);
app.use("/api/auth", authApi);

export default app;
