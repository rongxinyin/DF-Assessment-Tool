import express from 'express';
import { ResidentialACModel, CompressorType, BrandModel, ZipModel, ZoneModel, WaterHeaterModel, HotWaterUsagePattern, ResidentialWaterHeaterModel, FuelType, LocationType } from '../models/residential.js';

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

    // Interpolate between temperatures for more detailed results
    const extendedOutdoorTemps = [];
    for (let hour = 0; hour < outdoorTemps.length; hour++) {
        const startTemp = outdoorTemps[hour], endTemp = outdoorTemps[(hour + 1) % outdoorTemps.length];
        for (let min = 0; min < 60; min++)
            extendedOutdoorTemps.push(startTemp + (endTemp - startTemp) * min / 60);
    }

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
    const apartmentCount = parseInt(req.params.apartmentCount) || 1;

    let normalResults, drResults, normalEnergy, drEnergy;

    if (apartmentCount > 10 /* minimum amount for at least one person to be at edges */) {
        // Arrays to be averaged after all points along distribution are totaled
        normalResults = {
            setpoint: new Array(1440).fill(0), effectiveSetpoint: new Array(1440).fill(0),
            indoorTemp: new Array(1440).fill(0), outdoorTemp: extendedOutdoorTemps, powerConsumption: new Array(1440).fill(0)
        };
        drResults = {
            setpoint: new Array(1440).fill(0), effectiveSetpoint: new Array(1440).fill(0),
            indoorTemp: new Array(1440).fill(0), outdoorTemp: extendedOutdoorTemps, powerConsumption: new Array(1440).fill(0)
        };
        // Normal distribution calculations
        const sigma = 1.19, mu = 23.72, lowTemp = 21.83, highTemp = 25.61; // https://eta-publications.lbl.gov/sites/default/files/occupants_indoor_comform_temperature.pdf#p483R_mc1
        const distribution = x => apartmentCount / (sigma * Math.sqrt(2 * Math.PI)) * Math.exp(-Math.pow((x - mu) / sigma, 2) / 2);
        // Run simulation for 1°F chunks
        let totalPeople = 0;
        for (let temp = lowTemp; temp < highTemp; temp += 5 / 9) {
            let acModel = new ResidentialACModel(acParams, 20.0);
            acModel.setSetPoint(temp);
            const chunkNormalResults = acModel.simulatePeriod(extendedOutdoorTemps);

            acModel = new ResidentialACModel(acParams, 20.0);
            acModel.setSetPoint(temp);
            acModel.setDemandResponse(true, drSetpoint - normalSetpoint, parseInt(req.params.drStart), parseInt(req.params.drEnd));
            const chunkDrResults = acModel.simulatePeriod(extendedOutdoorTemps);

            const chunkHeight = distribution(temp + 5 / 9 / 2);
            totalPeople += chunkHeight;
            for (let i = 0; i < 1440; i++) {
                normalResults.setpoint[i] += chunkNormalResults.setpoint[i] * chunkHeight;
                normalResults.effectiveSetpoint[i] += chunkNormalResults.effectiveSetpoint[i] * chunkHeight;
                normalResults.indoorTemp[i] += chunkNormalResults.indoorTemp[i] * chunkHeight;
                normalResults.powerConsumption[i] += chunkNormalResults.powerConsumption[i] * chunkHeight;

                drResults.setpoint[i] += chunkDrResults.setpoint[i] * chunkHeight;
                drResults.effectiveSetpoint[i] += chunkDrResults.effectiveSetpoint[i] * chunkHeight;
                drResults.indoorTemp[i] += chunkDrResults.indoorTemp[i] * chunkHeight;
                drResults.powerConsumption[i] += chunkDrResults.powerConsumption[i] * chunkHeight;
            }
        }
        // Average values
        for (let i = 0; i < 1440; i++) {
            normalResults.setpoint[i] /= totalPeople;
            normalResults.effectiveSetpoint[i] /= totalPeople;
            normalResults.indoorTemp[i] /= totalPeople;

            drResults.setpoint[i] /= totalPeople;
            drResults.effectiveSetpoint[i] /= totalPeople;
            drResults.indoorTemp[i] /= totalPeople;
        }
    }
    else {
        // Single buildings or small complexes
        let acModel = new ResidentialACModel(acParams, 20.0);
        acModel.setSetPoint(normalSetpoint);

        normalResults = acModel.simulatePeriod(extendedOutdoorTemps);

        acModel = new ResidentialACModel(acParams, 20.0);
        acModel.setSetPoint(normalSetpoint);
        acModel.setDemandResponse(true, drSetpoint - normalSetpoint, parseInt(req.params.drStart), parseInt(req.params.drEnd), parseInt(req.params.apartmentCount));

        drResults = acModel.simulatePeriod(extendedOutdoorTemps);
    }

    normalEnergy = normalResults.powerConsumption.reduce((a, c) => a + c / 60);
    drEnergy = drResults.powerConsumption.reduce((a, c) => a + c / 60);

    if (apartmentCount <= 10) {
        // Single buildings or small complexes use single value distribution
        normalEnergy *= apartmentCount;
        drEnergy *= apartmentCount;
    }

    res.json({
        normalResults,
        drResults,
        normalEnergy,
        drEnergy,
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
router.get('/water_heaters/:brand', (req, res) => {
    WaterHeaterModel.findOne({ brand: req.params.brand })
        .then(doc => {
            if (!doc) {
                res.status(404).send('Brand not found');
            } else {
                res.json(doc.models);
            }
        })
        .catch(err => res.status(500).send(err.message));
});

router.get('/water_heaters', (req, res) => {
    WaterHeaterModel.find({})
        .then(docs => res.json(docs.map(doc => doc.brand)))
        .catch(err => res.status(500).send(err.message));
});

// Water Heater Calculations
router.get('/water_heaters/:whBrand/:whModel/:normalSetpoint,:drSetpoint,:drStart,:drEnd,:apartmentCount', async (req, res) => {
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

    // Water Heater parameters
    const whParams = {
        fuelType: FuelType.ELECTRIC_RESISTANCE, // or FuelType.HEAT_PUMP
        tankSize: model.volume, // gallons
        energyFactor: 0.92, // EF rating
        standbyLoss: 150.0, // W (typical for 50-gal tank)
        heatingPower: 4500.0, // W (typical 4.5 kW element)
        location: LocationType.GARAGE,
        deadband: 5.0, // °F
        inletTemp: 55.0, // °F
        ratedCop: model.uef, // COP at rated conditions (47°F ambient)
        ratedAmbientTemp: 47.0, // °F - rated ambient temperature
        copTempCoefficient: 0.04, // COP change per °F of ambient temp
        backupElementPower: 4500.0, // W - backup resistance element
        minHpAmbientTemp: 20.0 // °F - minimum temp for heat pump operation
    };

    const apartmentCount = parseInt(req.params.apartmentCount) || 1;
    const drStart = parseInt(req.params.drStart), drEnd = parseInt(req.params.drEnd);

    const usagePattern = new HotWaterUsagePattern()

    let whModel = new ResidentialWaterHeaterModel(whParams, usagePattern)

    const normalSetpoint = parseFloat(req.params.normalSetpoint), drSetpoint = parseFloat(req.params.drSetpoint);

    // Normal simulation
    whModel.setSetPoint(normalSetpoint);
    whModel.setSeason('summer');

    const normalResults = whModel.simulatePeriod(24, 1 / 60);
    normalResults.powerConsumption = normalResults.powerConsumption.map(p => p * apartmentCount);
    const normalEnergy = normalResults.powerConsumption.reduce((a, c) => a + c / 60 / 1000);

    // DR simulation
    whModel = new ResidentialWaterHeaterModel(whParams, usagePattern, normalSetpoint);
    whModel.setSetPoint(normalSetpoint);
    whModel.setSeason('summer');
    whModel.setDemandResponse(true, drSetpoint - normalSetpoint, drStart, drEnd);

    const drResults = whModel.simulatePeriod(24, 1 / 60);
    drResults.powerConsumption = drResults.powerConsumption.map(p => p * apartmentCount);
    const drEnergy = drResults.powerConsumption.reduce((a, c) => a + c / 60 / 1000);

    res.json({
        normalResults,
        drResults,
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
