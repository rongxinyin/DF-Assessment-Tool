import express from "express";
import AnalyticsModel from "../models/analytics.js";

const router = express.Router();

// Create requestCount document for the first time.
router.post("/initialAdd", async (req, res) => {
    let analytics = new AnalyticsModel(req.body);
    analytics.save().then(() => {
        res.json(analytics);
    }).catch((err) => {
        console.log(err);
    })
});

export default router;