import mongoose from "mongoose";

const analyticsSchema = mongoose.Schema({
    requestCount: Number
},
{collection: "analytics"});

var AnalyticsModel = mongoose.model("Analytics", analyticsSchema);

export default AnalyticsModel;