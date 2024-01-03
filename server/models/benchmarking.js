import mongoose from "mongoose";

const benchmarkingSchema = mongoose.Schema(
  {
    coordinates: [Number],
    siteID: { type: String, required: true },
    siteInfo: {
      doe_climate_zone: String,
      city: String,
      state: String,
      zip: Number,
      number_of_floor: Number,
      total_building_area_ft2: Number,
      net_selling_area_ft2: Number,
      total_stock_area_ft2: Number,
      number_of_HVAC: Number,
      program: String,
      utility: String,
    },

    fieldMetricBaselineRegression: [
      {
        event_id: Number,
        event_date: Date,
        shed_start_time_date: Date, // date + time
        shed_end_time_date: Date, // date + time
        peak_oat: Number,
        event_avg_oat: Number,
        peak_demand_intensity_wft2: Number,
        shed_avg_wft2: Number,
      },
    ],
  },

  { collection: "benchmarking" }
);

var BenchmarkingModel = mongoose.model("Benchmarking", benchmarkingSchema);

export default BenchmarkingModel;
