import express from "express";
import StateModel from "../models/states.js";

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
  StateModel.findOne({stateName: req.params.stateName})
    .then((docs) => {
      res.json(docs.loadShedDatabase.find(obj => obj.case_ID == req.params.case_ID));
    })
    .catch((err) => res.json(err));
});

//Gets the county name based on zipcode.
router.get("/:stateName/countyName/:zipcode", async (req, res) => {
  StateModel.findOne({stateName: req.params.stateName})
    .then((docs) => {
      res.json(docs.climateZones.find(obj => obj.zipcode == req.params.zipcode).county_name);
    })
    .catch((err) => res.json(err));
})

export default router;
