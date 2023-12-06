import express from "express";
import BenchmarkingModel from "../models/benchmarking.js";

const router = express.Router();

// example test data
const benchmarking = new BenchmarkingModel({
  coordinates: [1, 2],
  siteID: "ffff",
  siteInfo: [
    {
      doe_climate_zone: "String",
      city: "String",
      state: "String",
      zip: 1,
      number_of_floor: 1,
      total_building_area_ft2: 1,
      net_selling_area_ft2: 1,
      total_stock_area_ft2: 1,
      number_of_HVAC: 1,
      program: "String",
      utility: "String",
    },
  ],
  fieldMetricBaselineRegression: [
    {
      event_id: 1,
      event_date: new Date("30 July 2010 15:05 GMT-8"),
      shed_start_time_date: new Date("30 July 2010 14:00 GMT-8"),
      shed_end_time_date: new Date("30 July 2010 18:00 GMT-8"),
      peak_oat: 1,
      event_avg_oat: 1,
      peak_demand_intensity_wft2: 1,
      shed_avg_wft2: 1,
    },
  ],
});

benchmarking.save();

// add data to database
router.get("/add", async (req, res) => {
  res.send(benchmarking);
});

export default router;
