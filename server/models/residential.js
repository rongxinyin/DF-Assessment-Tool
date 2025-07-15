import mongoose from 'mongoose';

// Enums
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
