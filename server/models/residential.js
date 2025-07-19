import mongoose from 'mongoose';

// AC enums
export const CompressorType = {
    SINGLE_STAGE: 'single_stage',
    TWO_STAGE: 'two_stage'
};

export class ResidentialACModel {
    /**
     * @param {Object} acParams - AC parameters object
     * @param {number} initialTemp - Initial indoor temperature (°C)
     */
    constructor(acParams, initialTemp) {
        this.acParams = acParams;
        this.indoorTemp = initialTemp;
        this.setpoint = 24.0; // Default cooling setpoint (°C)
        this.compressorStage = 0; // 0=off, 1=stage1, 2=stage2
        this.powerConsumption = 0.0; // Current power consumption (kW)
        this.demandResponseActive = false;
        this.drSetpointOffset = 0.0; // Setpoint offset during demand response (K)
        this.time = 0;
        this.drStart = 0;
        this.drEnd = 0;

        // Control hysteresis tracking
        this.lastStage = 0;

        // Time step for simulation (hours)
        this.dt = 1 / 60; // 1 minute default
    }

    /**
     * @param {number} setpoint - New setpoint (°C)
     */
    setSetPoint(setpoint) {
        this.setpoint = setpoint;
    }

    /**
     * @param {boolean} active - Whether DR is active
     * @param {number} spOffset - Setpoint increase during DR (°C/K)
     * @param {number} start - DR start hour
     * @param {number} end - DR end hour
     */
    setDemandResponse(active, spOffset, start, end) {
        this.demandResponseActive = active;
        this.drSetpointOffset = active ? spOffset : 0.0;
        this.drStart = start;
        this.drEnd = end;
    }

    /**
     * @param {number} [hour] - Current time
     * @returns {number} - Set point with DR offset added
     */
    getEffectiveSetpoint(hour = this.time) {
        if (this.drStart <= hour && hour <= this.drEnd)
            return this.setpoint + this.drSetpointOffset;
        return this.setpoint;
    }

    /**
     * Update compressor stage based on thermostat control logic
     */
    updateControlLogic() {
        const effectiveSetpoint = this.getEffectiveSetpoint();
        const deadband = this.acParams.deadband;

        const coolingOnTemp = effectiveSetpoint + deadband / 2;
        const coolingOffTemp = effectiveSetpoint - deadband / 2;

        // For two-stage systems, define stage 2 threshold
        const stage2OnTemp = effectiveSetpoint + deadband * 1.5;

        if (this.acParams.compressorType === CompressorType.SINGLE_STAGE) {
            // Single stage control
            if (this.indoorTemp > coolingOnTemp)
                this.compressorStage = 1;
            else if (this.indoorTemp < coolingOffTemp)
                // Maintain current stage if within deadband
                this.compressorStage = 0;
        }
        else {  // Two-stage control
            if (this.indoorTemp > stage2OnTemp)
                this.compressorStage = 2;
            else if (this.indoorTemp > coolingOnTemp) {
                // Use stage 1, but add some hysteresis
                if (this.lastStage === 2 && this.indoorTemp > effectiveSetpoint + deadband * 0.8)
                    this.compressorStage = 2;  // Stay in stage 2 with hysteresis
                else
                    this.compressorStage = 1;
            }
            else if (this.indoorTemp < coolingOffTemp)
                // Maintain current stage if within deadband
                this.compressorStage = 0;
        }

        this.lastStage = this.compressorStage;
    }

    /**
     * Calculate current cooling power output based on compressor stage
     */
    calculateCoolingPower() {
        if (this.compressorStage === 0)
            return 0.0;
        if (this.compressorStage === 1)
            return this.acParams.compressorType === CompressorType.SINGLE_STAGE ?
                this.acParams.coolingCapacityStage2 :
                this.acParams.coolingCapacityStage1;
        return this.acParams.coolingCapacityStage2;
    }

    /**
     * Calculate electrical power consumption based on cooling output and COP
     */
    calculatePowerConsumption() {
        const coolingPower = this.calculateCoolingPower();

        if (coolingPower === 0)
            this.powerConsumption = 0.0;
        else if (this.compressorStage === 1)
            this.powerConsumption = coolingPower / (
                this.acParams.compressorType === CompressorType.SINGLE_STAGE ?
                    this.acParams.copStage2 :
                    this.acParams.copStage1
            );
        else
            this.powerConsumption = coolingPower / this.acParams.copStage2;
    }


    /**
     * Update indoor temperature using 1R1C thermal model
     * @param {number} outdoorTemp - Outdoor temperature (°C)
     * @param {number} [dt=1/60] - Time step (hours), uses default if not set
     */
    updateTemperature(outdoorTemp, dt) {
        // Heat transfer through building envelope (positive = heat gain)
        // Thermal resistance is the amount of temperature difference required to add a certain amount of thermal energy to an area
        // K/(K/kW) = kW
        const heatGain = (outdoorTemp - this.indoorTemp) / this.acParams.thermalResistance;

        // Cooling power (positive = heat removal)
        const coolingPower = this.calculateCoolingPower();

        // Net heat flow into the building
        const netHeatFlow = heatGain - coolingPower;

        // Temperature change: dT/dt = Q_net / C
        const tempChange = netHeatFlow * dt / this.acParams.thermalCapacitance;

        this.indoorTemp += tempChange;
    }

    /**
     * Simulate one time step
     * @param {number} outdoorTemp - Outdoor temperature (°C)
     * @param {number} [dt] - Time step (hours)
     * @returns {Object}
    */
    simulateStep(outdoorTemp, dt = 1 / 60) {
        this.updateControlLogic();
        this.calculatePowerConsumption();
        this.updateTemperature(outdoorTemp, dt);

        this.time += dt;

        return {
            indoorTemp: this.indoorTemp,
            powerConsumption: this.powerConsumption,
            compressorStage: this.compressorStage
        };
    }

    /**
     * Simulate over a period with varying outdoor temperatures
     * @param {number} outdoorTemps - List of outdoor temperatures (°C) for each time step
     * @param {number} [dt=1/60] - Time step (hours)
     * @returns {Object} - Object with simulation results
     */
    simulatePeriod(outdoorTemps, dt = 1 / 60) {
        this.dt = dt;

        const results = {
            time: [],
            indoorTemp: [],
            outdoorTemp: [],
            powerConsumption: [],
            compressorStage: [],
            setpoint: [],
            effectiveSetpoint: []
        };

        let time = 0;
        for (const outdoorTemp of outdoorTemps) {
            const { indoorTemp, power, stage } = this.simulateStep(outdoorTemp, dt);

            results.time.push(time);
            results.indoorTemp.push(indoorTemp);
            results.outdoorTemp.push(outdoorTemp);
            results.powerConsumption.push(this.powerConsumption);
            results.compressorStage.push(this.compressorStage);
            results.setpoint.push(this.setpoint);
            results.effectiveSetpoint.push(this.getEffectiveSetpoint(time));

            time += dt;
        }

        return results;
    }

    /**
     * Calculate total daily energy consumption
     * @param {number[]} outdoorTemps - List of outdoor temperatures for 24 hours
     * @param {number} [dt] - Time step (hours)
     * @returns {number} - Total energy consumption (kWh)
     */
    calculateDailyEnergy(outdoorTemps, dt) {
        const results = this.simulatePeriod(outdoorTemps, dt);

        let energyConsumption = 0;
        for (const power of results.powerConsumption)
            energyConsumption += this.dt * power;
        return energyConsumption;
    }

    /**
     * Get current model state and parameters
     * @returns {Object}
     */
    getModelInfo() {
        return {
            acParams: this.acParams,
            currentState: {
                indoorTemp: this.indoorTemp,
                setpoint: this.setpoint,
                effectiveSetpoint: this.getEffectiveSetpoint(),
                compressorStage: this.compressorStage,
                powerConsumption: this.powerConsumption,
                demandResponseActive: this.demandResponseActive,
                drSetpointOffset: this.drSetpointOffset
            }
        };
    }
}

// Water heater enums
export const FuelType = {
    ELECTRIC_RESISTANCE: "electric_resistance",
    HEAT_PUMP: "heat_pump"
};

export const LocationType = {
    INDOOR: "indoor",
    GARAGE: "garage"
};

// Constants
const WATER_DENSITY = 8.34; // lb/gallon
const WATER_SPECIFIC_HEAT = 1.0; // Btu/(lb·°F)
const BTU_TO_WH = 0.293071; // Wh per Btu

export class HotWaterUsagePattern {
    constructor(occupants = 3) {
        // Base daily usage patterns (gallons per hour for typical day)
        // Pattern based on typical residential usage: morning peak, evening peak
        this.dailyUsageProfile = [
            0.5, 0.3, 0.2, 0.2, 0.3, 1.5, // 0-5 AM: minimal usage, early morning start
            4.2, 6.8, 4.5, 2.1, 1.8, 1.5, // 6-11 AM: morning peak (showers, etc.)
            1.2, 1.0, 1.3, 1.8, 2.5, 3.2, // 12-5 PM: afternoon usage
            4.8, 6.2, 5.1, 3.8, 2.1, 1.2, // 6-11 PM: evening peak (dishes, baths)
        ].map(hour => hour * occupants); // Scale by number of occupants
        // Total usage (gallons)
        this.totalDailyusage = this.dailyUsageProfile.reduce((a, c) => a + c);
    }

    /**
     * Get hot water usage for a specific hour (0-23)
     * @param {number} hour - Current hour
     * @returns {number} - Water usage for hour (gallons)
     */
    getHourlyUsage(hour) {
        return this.dailyUsageProfile[hour % 24];
    }

    /**
     * Get instantaneous flow rate at any time
     * @param {number} timeHour - Current time
     * @returns {number} - Water flor rate (gal/hr)
     */
    getUsageRate(timeHours) {
        const hour = Math.floor(timeHours + 0.0000001 /* deal with floating point errors */) % 24;
        return this.dailyUsageProfile[hour];
    }
}

export class ResidentialWaterHeaterModel {
    /*
    Residential water heater thermal model (Electric Resistance and Heat Pump)

    The thermal model follows: 
    C * dT/dt = P_heating - Q_standby - Q_draw

    where:
    - C: thermal capacity of water in tank (Btu/°F)
    - P_heating: heating power input (Btu/hr)
    - Q_standby: standby heat loss (Btu/hr)
    - Q_draw: heat removal from hot water draw (Btu/hr)
 
    For heat pump units, P_heating accounts for COP-adjusted efficiency
    */

    constructor(whParams, usagePattern, initialTemp = 120.0, outsideAirTemp = 70.0) {
        this.whParams = whParams;
        this.usagePattern = usagePattern;
        this.waterTemp = initialTemp;
        this.outsideAirTemp = outsideAirTemp;

        this.setpoint = 120.0; // Default setpoint (°F)
        this.heatingElementOn = false;
        this.heatPumpOn = false; // For heat pump units
        this.backupElementOn = false; // Backup resistance element
        this.powerConsumption = 0.0; // Current power consumption (W)
        this.demandResponseActive = false;
        this.drSetpointOffset = 0.0; // Setpoint offset during demand response (°F)

        // Calculate thermal capacity of water in tank
        this.thermalCapacity = this.whParams.tankSize * WATER_DENSITY * WATER_SPECIFIC_HEAT; // Btu/°F

        // Time step for simulation (hours)
        this.dt = 1 / 60;

        // Seasonal ambient temperatures for different locations
        this.ambientTemps = {
            [LocationType.INDOOR]: { 'winter': 68, 'spring': 72, 'summer': 76, 'fall': 70 },
            [LocationType.GARAGE]: { 'winter': 45, 'spring': 60, 'summer': 85, 'fall': 55 }
        }

        this.currentSeason = 'summer'; // Default season
    }

    /**
     * @param {string} season
     */
    setSeason(season) {
        let oat;
        switch (season) {
            case 'winter':
                oat = 35;
                break;
            case 'spring':
                oat = 60;
                break;
            case 'summer':
                oat = 80;
                break;
            case 'fall':
                oat = 55;
                break;
            default:
                return; // Stop if invalid season
        }
        this.outsideAirTemp = oat;
        this.currentSeason = season;
    }

    /**
     * @param {number} temp - Outside air temperature (°F)
     */
    setOutsideAirTemp(temp) {
        this.outsideAirTemp = temp;
    }

    getAmbientTemperature() {
        return this.ambientTemps[this.whParams.location][this.currentSeason];
    }

    /**
     * Calculate heat pump COP based on outside air temperature
     * @returns {number} - Current COP of heat pump
     */
    calculateHeatPumpCop() {
        if (this.whParams.fuelType !== FuelType.HEAT_PUMP)
            return 1.0; // Electric resistance COP is always 1.0

        // Check if outside temperature is too low for heat pump operation
        if (this.outsideAirTemp < this.whParams.minHPAmbientTemp)
            return 0.0; // Heat pump disabled, use backup element

        // Calculate COP based on temperature difference from rated conditions
        const tempDiff = this.outsideAirTemp - this.whParams.ratedAmbientTemp;
        const copAdjustment = tempDiff * this.whParams.copTempCoefficient;

        const currentCop = this.whParams.ratedCop + copAdjustment;

        // Ensure COP doesn't go below 1.0 (less efficient than resistance heating)
        return Math.max(currentCop, 1.0);
    }

    /**
     * @param {number} setpoint - New setpoint (°F)
     */
    setSetPoint(setpoint) {
        this.setpoint = setpoint;
    }

    /**
     * Activate or deactivate demand response mode.
     * @param {boolean} active - Whether demand response is active.
     * @param {number} [setpointOffset] - Setpoint offset during demand response (°F).
     */
    setDemandResponse(active, setpointOffset = -10.0) {
        this.demandResponseActive = active;
        this.drSetpointOffset = active ? setpointOffset : 0.0;
    }

    /**
     * Get the effective setpoint considering demand response.
     * @returns {number} - The effective setpoint temperature (°F).
     */
    getEffectiveSetpoint() {
        return this.setpoint + this.drSetpointOffset;
    }

    /**
     * Update heating element/heat pump on/off based on thermostat settings.
     */
    updateHeatingControl() {
        const effectiveSetpoint = this.getEffectiveSetpoint();
        const deadband = this.whParams.deadband;

        // Heating thresholds
        const heatingOnTemp = effectiveSetpoint - deadband / 2;
        const heatingOffTemp = effectiveSetpoint + deadband / 2;

        // Determine if heating is needed
        let heatingNeeded = false;
        if (this.waterTemp < heatingOnTemp)
            heatingNeeded = true;
        else if (this.waterTemp > heatingOffTemp)
            heatingNeeded = false;
        else
            // Maintain current state if within deadband
            heatingNeeded = this.heatingElementOn || this.heatPumpOn;

        if (this.whParams.fuelType === FuelType.ELECTRIC_RESISTANCE) {
            // Simple electric resistance control
            this.heatingElementOn = heatingNeeded;
            this.heatPumpOn = false;
            this.backupElementOn = false;
        } else { // Heat pump water heater
            const currentCop = this.calculateHeatPumpCop();

            if (heatingNeeded) {
                // Check if heat pump can operate efficiently
                if (currentCop > 1.5) {  // Use heat pump if COP is reasonable
                    this.heatPumpOn = true;
                    this.backupElementOn = false;
                    this.heatingElementOn = false;
                } else {
                    // Use backup electric resistance when COP is too low
                    this.heatPumpOn = false;
                    this.backupElementOn = true;
                    this.heatingElementOn = false;
                }

                // Emergency backup: if water temp is critically low, use both
                if (this.waterTemp < (effectiveSetpoint - deadband * 2))
                    this.backupElementOn = true;
            } else {
                // No heating needed
                this.heatPumpOn = false;
                this.backupElementOn = false;
                this.heatingElementOn = false;
            }
        }
    }

    /**
     * Calculate standby heat loss (Btu/hr)
     * @returns {number} - Standby heat loss (Btu/hr)
     */
    calculateStandbyLoss() {
        const ambientTemp = this.getAmbientTemperature();
        const tempDiff = this.waterTemp - ambientTemp;

        // Convert standby loss from W to Btu/hr
        const standbyLossBtuHr = this.whParams.standbyLoss / BTU_TO_WH;

        // Scale by temperature difference (simplified approximation)
        const referenceTempDiff = 60; // °F (typical rating condition)
        const scaledLoss = standbyLossBtuHr * (tempDiff / referenceTempDiff);

        return Math.max(0, scaledLoss);
    }

    /**
     * Calculate heat loss due to hot water draw (Btu/hr)
     * @param {number} usageRate - Hot water usage rate (gallons/hour)
     * @returns {number} - Heat loss from hot water draw (Btu/hr)
     */
    calculateDrawHeatLoss(usageRate) {
        if (usageRate <= 0)
            return 0.0;

        // Heat required to heat cold water to tank temperature
        const tempRise = this.waterTemp - this.whParams.inletTemp;
        const heatLoss = usageRate * WATER_DENSITY * WATER_SPECIFIC_HEAT * tempRise; // Btu/hr

        return heatLoss;
    }

    /**
     * Calculate electrical power consumption in watts
     * @returns {number} - Total power consumption (W)
     */
    calculatePowerConsumption() {
        let totalPower = 0.0;

        if (this.whParams.fuelType === FuelType.ELECTRIC_RESISTANCE) {
            // Simple electric resistance heating
            if (this.heatingElementOn)
                totalPower += this.whParams.heatingPower;
        }
        else { // Heat pump water heater
            if (this.heatPumpOn)
                // Heat pump power consumption based on COP
                totalPower += this.whParams.heatPumpPower / this.calculateHeatPumpCop(); // Electrical Watts
            if (this.backupElementOn)
                // Add backup resistance element power
                totalPower += this.whParams.backupElementPower;
        }

        this.powerConsumption = totalPower;
        return totalPower;
    }

    /**
     * @param {number} usageRate - Hot water usage rate (gallons/hour)
     * @param {number} [dt] - Time step (hours)
     */
    updateTemperature(usageRate, dt = this.dt) {
        // Calculate heat flows (Btu/hr)
        const standbyLoss = this.calculateStandbyLoss();
        const drawLoss = this.calculateDrawHeatLoss(usageRate);

        let heatingInput = 0.0; // Btu/hr

        if (this.whParams.fuelType === FuelType.ELECTRIC_RESISTANCE) {
            if (this.heatingElementOn)
                heatingInput = this.whParams.heatingPower / BTU_TO_WH;
        }
        else { // Heat pump water heater
            if (this.heatPumpOn)
                // Heat pump provides thermal energy based on COP
                heatingInput = this.whParams.heatingPower / BTU_TO_WH;
            if (this.backupElementOn)
                // Add backup resistance heating
                heatingInput += this.whParams.backupElementPower / BTU_TO_WH;
        }

        const netHeatFlow = heatingInput - standbyLoss - drawLoss; // Btu/hr
        // Temperature change: dT/dt = Q_net / C
        const tempChange = netHeatFlow * dt / this.thermalCapacity;
        this.waterTemp += tempChange;
        // Ensure temperature doesn't go below inlet temperature
        this.waterTemp = Math.max(this.waterTemp, this.whParams.inletTemp);
    }

    /**
     * Simulate one time step
     * @param {number} timeHours - Current simulation time (hours from start)
     * @param {number} [dt] = Time step (hours)
     * @returns {Object} - Object with appliance information
     */
    simulateStep(timeHours, dt) {
        const usageRate = this.usagePattern.getUsageRate(timeHours);

        this.updateHeatingControl();
        this.calculatePowerConsumption();
        this.updateTemperature(usageRate, dt);

        const heatingActive = this.heatingElementOn || this.heatPumpOn || this.backupElementOn;

        const operationInfo = {
            heatPumpOn: this.heatPumpOn,
            backupElementOn: this.backupElementOn,
            heatingElementOn: this.heatingElementOn,
            currentCop: this.whParams.fuelType === FuelType.HEAT_PUMP ? this.calculateHeatPumpCop() : 1.0,
            outsideAirTemp: this.outsideAirTemp
        };

        return {
            waterTemp: this.waterTemp,
            powerConsumption: this.powerConsumption,
            heatingActive,
            operationInfo
        };
    }

    /**
     * Simulate over a time period
     * @param {number} [durationHours] - Simulation duration (hours)
     * @param {number} [dt] - Time step (hours)
     * @returns {Object} - Object with simulation results
     */
    simulatePeriod(durationHours = 24, dt = 1 / 60) {
        this.dt = dt;

        const results = {
            time: [],
            waterTemp: [],
            powerConsumption: [],
            heatingActive: [],
            setpoint: [],
            effectiveSetpoint: [],
            usageRate: [],
            standbyLoss: [],
            ambientTemp: [],
            outsideAirTemp: [],
            heatPumpOn: [],
            backupElementOn: [],
            heatingElementOn: [],
            currentCop: []
        };

        let powerTotal = 0;
        for (let timeHours = 0; timeHours < durationHours; timeHours += dt) {
            const usageRate = this.usagePattern.getUsageRate(timeHours);
            const { waterTemp, powerConsumption, heatingActive, operationInfo } = this.simulateStep(timeHours, dt);
            powerTotal += powerConsumption;

            results.time.push(timeHours);
            results.waterTemp.push(waterTemp);
            results.powerConsumption.push(powerConsumption);
            results.heatingActive.push(heatingActive);
            results.setpoint.push(this.setpoint);
            results.effectiveSetpoint.push(this.getEffectiveSetpoint());
            results.usageRate.push(usageRate);
            results.standbyLoss.push(this.calculateStandbyLoss());
            results.ambientTemp.push(this.getAmbientTemperature());
            results.outsideAirTemp.push(this.outsideAirTemp);
            results.heatPumpOn.push(operationInfo.heatPumpOn);
            results.backupElementOn.push(operationInfo.backupElementOn);
            results.heatingElementOn.push(operationInfo.heatingElementOn);
            results.currentCop.push(operationInfo.currentCop);
        }

        return results;
    }

    /**
     * Calculate total daily energy consumption
     * @param {number} [dt] - Time step (hours)
     * @returns {number} - Daily energy consumption (kWh)
     */
    calculateDailyEnergy(dt = this.dt) {
        const results = this.simulatePeriod(24, dt);
        console.log(results.powerConsumption.reduce((a, c) => a + c))
        const energyConsumption = results.powerConsumption.reduce((a, c) => a + c * dt / 1000 /* W to kW */, 0);
        return energyConsumption;
    }

    /**
     * Get current model state and parameters
     * @returns {Object} 
     */
    getModelInfo() {
        return {
            waterHeaterParameters: {
                tankSize: this.whParams.tankSize,
                energyFactor: this.whParams.energyFactor,
                standbyLoss: this.whParams.standbyLoss,
                heatingPower: this.whParams.heatingPower,
                location: this.whParams.location.value,
                deadband: this.whParams.deadband,
                inletTemp: this.whParams.inletTemp
            },
            usagePattern: {
                numOccupants: this.usagePattern.numOccupants,
                totalDailyUsage: this.usagePattern.totalDailyUsage
            },
            currentState: {
                waterTemp: this.waterTemp,
                setpoint: this.setpoint,
                effectiveSetpoint: this.getEffectiveSetpoint(),
                heatingElementOn: this.heatingElementOn,
                powerConsumption: this.powerConsumption,
                demandResponseActive: this.demandResponseActive,
                drSetpointOffset: this.drSetpointOffset,
                currentSeason: this.currentSeason,
                ambientTemp: this.getAmbientTemperature()
            }
        };
    }
}

const brandSchema = mongoose.Schema(
    {
        brand: { type: String, required: true },
        models: [
            {
                es_id: String,
                model: String,
                capacity: Number,
                cop: Number
            }
        ],
    },
    { collection: 'air_conditioners' }
);
export const BrandModel = mongoose.model('Brand', brandSchema);

const zipSchema = mongoose.Schema(
    {
        zipcode: { type: String, required: true },
        climateZone: String,
        state: String
    },
    { collection: 'zip_map' }
);
export const ZipModel = mongoose.model('Zip', zipSchema);

const zoneSchema = mongoose.Schema(
    {
        zone: { type: String, required: true },
        temps: [Number]
    },
    { collection: 'average_oat' }
);
export const ZoneModel = mongoose.model('Zone', zoneSchema);

const waterHeaterSchema = mongoose.Schema(
    {
        brand: { type: String, required: true },
        models: [
            {
                es_id: String,
                model: String,
                volume: Number,
                uef: Number
            }
        ]
    },
    { collection: 'water_heaters' }
);

export const WaterHeaterModel = mongoose.model('WaterHeater', waterHeaterSchema);
