import express from "express";
import StateModel from "../models/states.js";
import {
  createCaseIDs,
  gtaCalculation,
} from "../../client/src/logic/DR_Calculations.js";

const router = express.Router();

//Creates new document for energy and climate data for a US State.
router.post("/createStateData", async (req, res) => {
  let state = new StateModel(req.body);
  state
    .save()
    .then(() => res.json(state))
    .catch((err) => res.json(err));
});

//Creates a new field for the given US State.
router.patch("/:stateName/new/:fieldName", async (req, res) => {
  const fieldName = req.params.fieldName;
  let result = await StateModel.findOneAndUpdate(
    { stateName: req.params.stateName },
    { [fieldName]: req.body }
  );

  res.send(result).status(200);
});

//Gets the LoadShed data for a given caseID in a given state.
router.get("/:stateName/loadShedDatabase/:case_ID", async (req, res) => {
  StateModel.findOne({ stateName: req.params.stateName })
    .then((docs) => {
      res.json(
        docs.loadShedDatabase.find((obj) => obj.case_ID == req.params.case_ID)
      );
    })
    .catch((err) => res.json(err));
});

//Gets the county name based on zipcode.
router.get("/:stateName/countyName/:zipcode", async (req, res) => {
  StateModel.findOne({ stateName: req.params.stateName })
    .then((docs) => {
      res.json(
        docs.climateZones.find((obj) => obj.zipcode == req.params.zipcode)
          .county_name
      );
    })
    .catch((err) => res.json(err));
});

//Gets an entire field for a given state.
router.get("/:stateName/:fieldName", async (req, res) => {
  StateModel.findOne({ stateName: req.params.stateName })
    .then((docs) => {
      res.json(docs[req.params.fieldName]);
    })
    .catch((err) => res.json(err));
});

//Route to test GTA calculation function (using hardcoded values).
router.get("/testGTA", async (req, res) => {
  let caseIDs = [
    "MAMediumOffice021",
    "MAMediumOffice022",
    "MAMediumOffice023",
    "MAMediumOffice024",
  ];
  let CSSB = [
    {
      avg_temp: 100,
      avg_demand: 200,
    },
    {
      avg_temp: 98,
      avg_demand: 230,
    },
    {
      avg_temp: 87,
      avg_demand: 240,
    },
    {
      avg_temp: 87,
      avg_demand: 230,
    },
  ];
  let result = await gtaCalculation("Massachusetts", caseIDs, CSSB);
  res.json(result);
});

//Route to test createCaseIDs
router.get("/testCaseIDs", async (req, res) => {
  res.json(createCaseIDs("MA", "SmallOffice", 2004, 0, 5));
});

export default router;
