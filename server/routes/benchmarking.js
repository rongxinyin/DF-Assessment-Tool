import express from "express";
import BenchmarkingModel from "../models/benchmarking.js";

const router = express.Router();

// get all benchmarking data
// router.get("/:stateName/loadShedDatabase/:case_ID", async (req, res) => {
//     StateModel.findOne({ stateName: req.params.stateName })
//       .then((docs) => {
//         res.json(
//           docs.loadShedDatabase.find((obj) => obj.case_ID == req.params.case_ID)
//         );
//       })
//       .catch((err) => res.json(err));
//   });

export default router;
