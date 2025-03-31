import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express()
app.use(cors({
    origin: "*",  // Sab domains allow karne ke liye
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }));

app.use(express.json());

app.use(express.urlencoded({
    limit: "20kb",
    extended: true
}))
app.use(express.static("public"))

app.use(cookieParser());

// routers setup

import userRouter from "./routes/users.js"
import videoRouter from "./routes/video.js"
import commentRouter from "./routes/comment.js"
import playListRouter from "./routes/playList.js"
import subscriptionRouter from "./routes/subscription.js"
import likesRouter from "./routes/likes.js"
import dashboardRouter from "./routes/dashboard.js"
import healthCheckRouter from "./routes/healthCheck.js"

app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/playlist", playListRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/likes", likesRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/health-check", healthCheckRouter);

export default app;