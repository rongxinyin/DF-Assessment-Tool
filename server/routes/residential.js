import express from 'express';
import { ResidentialACModel, CompressorType, BrandModel, ZipModel, ZoneModel, WaterHeaterModel, HotWaterUsagePattern, ResidentialWaterHeaterModel, FuelType, LocationType} from '../models/residential.js';

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

// Water Heaters//
router.get('/water_heaters/:brand',(req, res) => {
    WaterHeaterModel.findOne({ brand: req.params.brand})
        .then(doc => {
            if (!doc) {
                res.status(404).send('Brand not found');
            } else {
                res.json(doc.models);
            }
        })
        .catch(err=> res.status(500).send(err.message));
});

router.get('/water_heaters', (req, res) => {
    WaterHeaterModel.find({})
    .then(docs => res.json(docs.map(doc => doc.brand)))
    .catch(err => res.status(500).send(err.message));
});

// Water Heater Calculations //
    router.get('/water_heaters/:whBrand/:whModel/', async (req, res) => {
         const apartmentCount = 1
         const brand = await WaterHeaterModel.findOne({ brand: req.params.whBrand });
             if (!brand) {
                res.status(400).send('Brand not found');
                return;
             }

             const model = brand.models.find(m => m.model === req.params.whModel);
             if (!model) {
                res.status(400).send('Model not found');
                return;
             }

            // Water Heater parameters //
            const whParams = {
            fuelType: FuelType.ELECTRIC_RESISTANCE, // or FuelType.HEAT_PUMP
            tankSize: 50.0, // gallons
            energyFactor: 0.92, // EF rating
            standbyLoss: 150.0, // W (typical for 50-gal tank)
            heatingPower: 4500.0, // W (typical 4.5 kW element)
            location: LocationType.GARAGE,
            deadband: 5.0, // °F
            inletTemp: 55.0, // °F
            ratedCop: 3.00, // COP at rated conditions (47°F ambient)
            ratedAmbientTemp: 47.0, // °F - rated ambient temperature
            copTempCoefficient: 0.04, // COP change per °F of ambient temp
            backupElementPower: 4500.0, // W - backup resistance element
            minHpAmbientTemp: 20.0 // °F - minimum temp for heat pump operation
            };

            const usagePattern = new HotWaterUsagePattern()

            let whModel = new ResidentialWaterHeaterModel(whParams, usagePattern)

            whModel.setSetPoint(120.0);
            whModel.setSeason('summer');
            
            const normalResults = whModel.simulatePeriod(24, 1 / 60);
            const normalEnergy = normalResults.powerConsumption.reduce((a, c) => a + c / 60 / 1000);
            
            whModel = new ResidentialWaterHeaterModel(whParams, usagePattern, 120.0);
            whModel.setSetPoint(120.0);
            whModel.setSeason('summer');
            whModel.setDemandResponse(true, -15.0);
            
            const drResults = whModel.simulatePeriod(24, 1 / 60);
            const drEnergy = drResults.powerConsumption.reduce((a, c) => a + c / 60 / 1000);

            const savings = ((normalEnergy * apartmentCount) - drEnergy) / (normalEnergy * apartmentCount) * 100;

            res.json({
                normalResults,
                drResults,
                savings,
                normalEnergy,
                drEnergy,
            }); 
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
