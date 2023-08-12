import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";

import analyticsRoutes from "./routes/analytics.js";
import stateRoutes from "./routes/states.js";

// app
const app = express();

//middleware
app.use(morgan("dev"));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
dotenv.config();

//routes
app.use("/analytics", analyticsRoutes);
app.use("/states", stateRoutes);

//connect
mongoose.connect(process.env.CONNECTION_URL);
const db = mongoose.connection;
db.once("open", () => console.log(`Connected to database`));

//listener
const port = 8080;
const server = app.listen(port, () =>
  console.log(`Server is running on port ${port}`)
);
