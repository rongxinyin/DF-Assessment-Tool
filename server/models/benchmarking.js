import mongoose from "mongoose";

const benchmarkingSchema = mongoose.Schema(
  {
    siteName: { type: String, required: true },
  },
  { collection: "benchmarking" }
);

var BenchmarkingModel = mongoose.model("Benchmarking", benchmarkingSchema);

export default BenchmarkingModel;
