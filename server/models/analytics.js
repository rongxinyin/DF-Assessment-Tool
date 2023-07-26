import mongoose from "mongoose";

const analyticsSchema = mongoose.Schema(
  {
    basicRequestCount: Number,
    advancedRequestCount: Number,
  },
  { collection: "analytics" }
);

var AnalyticsModel = mongoose.model("Analytics", analyticsSchema);

export default AnalyticsModel;
