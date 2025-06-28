import express from 'express';
import { ResidentialACModel, CompressorType, BrandModel, ZipModel, ZoneModel } from '../models/residential.js';

const BTU_PER_HOUR_TO_KW =
    (4.1868 * 453.59237 * 5 / 9) // BTU to Joules
    / 3600 // hours to seconds
    / 1000; // Watts to kilowatts

const router = express.Router();

// Given a brand and model, find parameters for the model and return DR results
router.get('/ac/brands/:acBrand/:acModel/:zip', async (req, res) => {
    const model =
        (await BrandModel.findOne({ brand: req.params.acBrand }))
            .models.find(model => model.model === req.params.acModel);
    if (!model) {
        res.status(400).send('Could not find model');
        return;
    }

    const zone = (await ZipModel.findOne({ zipcode: req.params.zip })).climateZone;
    if (!zone) {
        res.status(400).send('Invalid ZIP code');
        return;
    }

    const outdoorTemps = (await ZoneModel.findOne({ zone })).temps;

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

    let acModel = new ResidentialACModel(acParams, 20.0);
    acModel.setSetPoint(18)

    const normalResults = acModel.simulatePeriod(outdoorTemps, 1);
    const normalEnergy = normalResults.powerConsumption.reduce((a, c) => a + c / 60);

    acModel = new ResidentialACModel(acParams, 20.0);
    acModel.setSetPoint(18);
    acModel.setDemandResponse(true, 2.0)

    const drResults = acModel.simulatePeriod(outdoorTemps, 1);
    const drEnergy = drResults.powerConsumption.reduce((a, c) => a + c / 60);

    const savings = (normalEnergy - drEnergy) / normalEnergy * 100;
    console.log(normalResults, drResults)

    res.json({
        normalEnergy,
        drEnergy,
        savings
    });
});

router.get('/ac/brands/:acBrand', (req, res) => {
    BrandModel.findOne({ brand: req.params.acBrand })
        .then(docs => res.json(docs.models.map(model => model.model)))
        .catch(res.json);
});

router.get('/ac/brands', (req, res) => {
    BrandModel.find({})
        .then(docs => res.json(docs.map(doc => doc.brand)))
        .catch(res.json);
});

export default router;
