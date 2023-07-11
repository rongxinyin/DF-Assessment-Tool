import express from "express";
import StateModel from "../models/states.js";

const router = express.Router();

//Creates new document for energy and climate data for a US State.
router.post("/createStateData", async (req, res) => {
  let state = new StateModel(req.body);
  state
    .save()
    .then(() => {
      res.json(state);
    })
    .catch((err) => {
      res.json(err);
    });
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

export default router;
