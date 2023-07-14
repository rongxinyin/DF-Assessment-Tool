import mongoose from "mongoose";

const stateSchema = mongoose.Schema(
  {
    stateName: { type: String, required: true },
    //IDAR_Meter_Data only if available to the user, otherwise it will be input based.
    IDARMeterData: [
      {
        date: Date,
        demand: Number,
      },
    ],
    CSSB: [
      {
        range_id: Number,
        avg_temp: Number,
        avg_demand: Number,
      },
    ],
    outsideTemp: [
      {
        date: Date,
        temp: Number,
      },
    ],
    climateZones: [
      {
        zipcode: Number,
        county_name: String,
        cz_zone: String, //only for California
      },
    ],
    ASHRAEClimateZone: { type: String, default: "" },
    loadShedDatabase: [
      {
        case_ID: String,
        equations: [
          {
            temp_category: String, // OAT<=75, 75<OAT<95, OAT>=95
            equation_slope: Number,
            equation_intercept: Number,
          },
        ],
      },
    ],
  },
  { collection: "states" }
);

var StateModel = mongoose.model("State", stateSchema);

export default StateModel;
