import express from "express";
import AnalyticsModel from "../models/analytics.js";

const router = express.Router();

// Create requestCount document for the first time.
router.post("/initialAdd", async (req, res) => {
  let analytics = new AnalyticsModel(req.body);
  analytics
    .save()
    .then(() => {
      res.json(analytics);
    })
    .catch((err) => {
      console.log(err);
    });
});

// Update request counts
router.patch("/requestUpdate/:pageType", async (req, res) => {
  let pageType = req.params.pageType;
  AnalyticsModel.find()
    .then(async (docs) => {
      let analyticsObj = docs[0];
      if (pageType == "basic") {
        let newBasicCount = analyticsObj.basicRequestCount + 1;
        let result = await AnalyticsModel.findOneAndUpdate(
          { _id: analyticsObj._id },
          { basicRequestCount: newBasicCount }
        );
        res.json(result);
      }
      if (pageType == "advanced") {
        let newAdvancedCount = analyticsObj.advancedRequestCount + 1;
        let result = await AnalyticsModel.findOneAndUpdate(
          { _id: analyticsObj._id },
          { advancedRequestCount: newAdvancedCount }
        );
        res.json(result);
      }
    })
    .catch((err) => res.json(err));
});

export default router;
