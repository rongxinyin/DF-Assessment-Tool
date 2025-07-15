import express from 'express';
import { ResidentialACModel, CompressorType, BrandModel, ZipModel, ZoneModel } from '../models/residential.js';

const BTU_PER_HOUR_TO_KW =
    (4.1868 * 453.59237 * 5 / 9) // BTU to Joules
    / 3600 // hours to seconds
    / 1000; // Watts to kilowatts

const router = express.Router();

const getTemps = async (zip, res) => {
    const zone = (await ZipModel.findOne({ zipcode: zip }));
    if (!zone) {
        res.status(400).send('Invalid ZIP code');
        return;
    }

    return (await ZoneModel.findOne({ zone: zone.climateZone })).temps;
};

// Given a brand and model, find parameters for the model and return DR results
router.get('/ac/brands/:acBrand/:acModel/:zip,:normalSetpoint,:drSetpoint,:drStart,:drEnd,:apartmentCount', async (req, res) => {
    const model =
        (await BrandModel.findOne({ brand: req.params.acBrand }))
            .models.find(model => model.model === req.params.acModel);
    if (!model) {
        res.status(400).send('Could not find model');
        return;
    }

    const outdoorTemps = await getTemps(req.params.zip, res);

    const acParams = {
        coolingCapacityStage1: 3.5, // kW
        coolingCapacityStage2: model.capacity * BTU_PER_HOUR_TO_KW, // kW (total capacity)
        copStage1: 4.5,
        copStage2: model.cop,
        compressorType: CompressorType.SINGLE_STAGE,
        thermalResistance: 2.0, // K/kW
        thermalCapacitance: 5.0, // kWh/K
        deadband: 0.5 // K
    }

    const normalSetpoint = (parseFloat(req.params.normalSetpoint) - 32) * 5 / 9,
        drSetpoint = (parseFloat(req.params.drSetpoint) - 32) * 5 / 9;
    let acModel = new ResidentialACModel(acParams, 20.0);
    acModel.setSetPoint(normalSetpoint);

    const apartmentCount = parseInt(req.params.apartmentCount) || 1;

    const normalResults = acModel.simulatePeriod(outdoorTemps, 1);
    const normalEnergy = normalResults.powerConsumption.reduce((a, c) => a + c / 60) *apartmentCount;

    acModel = new ResidentialACModel(acParams, 20.0);
    acModel.setSetPoint(normalSetpoint);
    acModel.setDemandResponse(true, drSetpoint - normalSetpoint, parseInt(req.params.drStart), parseInt(req.params.drEnd), parseInt(req.params.apartmentCount));

    const drResults = acModel.simulatePeriod(outdoorTemps, 1);
    const drEnergy = drResults.powerConsumption.reduce((a, c) => a + c / 60) *apartmentCount;

    const savings = (normalEnergy - drEnergy) / normalEnergy * 100;

    res.json({
        normalResults,
        drResults,
        savings
    });
});

router.get('/ac/brands/:acBrand', (req, res) => {
    BrandModel.findOne({ brand: req.params.acBrand })
        .then(docs => res.json(docs.models))
        .catch(res.json);
});

router.get('/ac/brands', (req, res) => {
    BrandModel.find({})
        .then(docs => res.json(docs.map(doc => doc.brand)))
        .catch(res.json);
});

router.get('/temps/:zip', (req, res) => {
    getTemps(req.params.zip, res).then(temps => res.json(temps));
});

router.get('/zip-states/:zip', async (req, res) => {
  try {
    const zipData = await ZipModel.findOne(
      { zipcode: req.params.zip },
      { zipcode: 1, state: 1, _id: 0 }
    );
    if (!zipData) {
      return res.status(400).json({ message: 'Invalid ZIP code' });
    }
    res.json(zipData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching zip data', error });
  }
});

router.get('/climate-zone/:zip', async (req, res) => {
  try {
    const zipData = await ZipModel.findOne(
      { zipcode: req.params.zip },
      { zipcode: 1, climateZone: 1, _id: 0 }
    );
    if (!zipData) {
      return res.status(400).json({ message: 'Invalid ZIP code' });
    }
    res.json(zipData);
  } catch (error) {
    console.error('Error fetching climate zone:', error);
    res.status(500).json({ message: 'Error fetching climate zone', error });
  }
});

export default router;
