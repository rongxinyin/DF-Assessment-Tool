import express from "express";
import BenchmarkingModel from "../models/benchmarking.js";

const router = express.Router();

// example test data

// coordinates: [longitude, latitude]]
// Longitude values range between -180 and 180 degrees.
// The latitude of any point on Earth must be within the range of -90 degrees (South Pole) to +90 degrees (North Pole).

const siteT0363 = new BenchmarkingModel({
  coordinates: [-111.90035901867124, 33.505432052079726],
  siteID: "T0363",
  siteInfo: {
    doe_climate_zone: "2B",
    city: "Scottsdale",
    state: "AZ",
    zip: 85250,
    number_of_floor: 1,
    total_building_area_ft2: 105730,
    net_selling_area_ft2: 66896,
    total_stock_area_ft2: 17461,
    number_of_HVAC: 19,
    program: "SRP Business Demand Response",
    utility: "Salt River Project/80062",
  },

  fieldMetricBaselineRegression: [
    {
      event_id: 0,
      event_date: new Date("13 May 2020"),
      shed_start_time_date: new Date("13 May 2020 13:00 GMT-8"),
      shed_end_time_date: new Date("13 May 2020 14:00 GMT-8"),
      peak_oat: 89.168,
      event_avg_oat: 86.6138,
      peak_demand_intensity_wft2: 2.384690525,
      shed_avg_wft2: 0.341998249,
    },
    {
      event_id: 1,
      event_date: new Date("10 July 2020"),
      shed_start_time_date: new Date("10 July 2020 16:00 GMT-8"),
      shed_end_time_date: new Date("10 July 2020 18:00 GMT-8"),
      peak_oat: 110.372,
      event_avg_oat: 110.0175,
      peak_demand_intensity_wft2: 3.02982042,
      shed_avg_wft2: 0.640027907,
    },
    {
      event_id: 2,
      event_date: new Date("13 July 2020"),
      shed_start_time_date: new Date("13 July 2020 16:00 GMT-8"),
      shed_end_time_date: new Date("13 July 2020 18:00 GMT-8"),
      peak_oat: 110.462,
      event_avg_oat: 109.2625,
      peak_demand_intensity_wft2: 3.051825024,
      shed_avg_wft2: 0.752736631,
    },
    {
      event_id: 3,
      event_date: new Date("28 July 2020"),
      shed_start_time_date: new Date("28 July 2020 18:00 GMT-8"),
      shed_end_time_date: new Date("28 July 2020 20:00 GMT-8"),
      peak_oat: 112.28,
      event_avg_oat: 108.2995,
      peak_demand_intensity_wft2: 3.158712515,
      shed_avg_wft2: 0.760393466,
    },
    {
      event_id: 4,
      event_date: new Date("01 August 2020"),
      shed_start_time_date: new Date("01 August 2020 14:00 GMT-8"),
      shed_end_time_date: new Date("01 August 2020 17:00 GMT-8"),
      peak_oat: 108.878,
      event_avg_oat: 107.4781538,
      peak_demand_intensity_wft2: 3.147781481,
      shed_avg_wft2: 0.728914967,
    },
    {
      event_id: 5,
      event_date: new Date("14 August 2020"),
      shed_start_time_date: new Date("14 August 2020 18:00 GMT-8"),
      shed_end_time_date: new Date("14 August 2020 20:00 GMT-8"),
      peak_oat: 115.07,
      event_avg_oat: 110.604,
      peak_demand_intensity_wft2: 3.164644457,
      shed_avg_wft2: 0.847034782,
    },
    {
      event_id: 7,
      event_date: new Date("18 August 2020"),
      shed_start_time_date: new Date("18 August 2020 17:00 GMT-8"),
      shed_end_time_date: new Date("18 August 2020 19:00 GMT-8"),
      peak_oat: 112.28,
      event_avg_oat: 109.0,
      peak_demand_intensity_wft2: 3.09368714,
      shed_avg_wft2: 0.879245143,
    },
    {
      event_id: 8,
      event_date: new Date("24 August 2020"),
      shed_start_time_date: new Date("24 August 2020 17:00 GMT-8"),
      shed_end_time_date: new Date("24 August 2020 19:00 GMT-8"),
      peak_oat: 113.756,
      event_avg_oat: 110.7765,
      peak_demand_intensity_wft2: 3.079068922,
      shed_avg_wft2: 0.888846128,
    },
    {
      event_id: 9,
      event_date: new Date("04 September 2020"),
      shed_start_time_date: new Date("04 September 2020 16:00 GMT-8"),
      shed_end_time_date: new Date("04 September 2020 18:00 GMT-8"),
      peak_oat: 113.27,
      event_avg_oat: 112.592,
      peak_demand_intensity_wft2: 3.062006944,
      shed_avg_wft2: 2.2439166,
    },
    {
      event_id: 10,
      event_date: new Date("17 June 2021"),
      shed_start_time_date: new Date("17 June 2021 18:00 GMT-8"),
      shed_end_time_date: new Date("17 June 2021 21:00 GMT-8"),
      peak_oat: 116.942,
      event_avg_oat: 109.0614615,
      peak_demand_intensity_wft2: 3.08024272,
      shed_avg_wft2: 0.496374392,
    },
    {
      event_id: 11,
      event_date: new Date("18 June 2021"),
      shed_start_time_date: new Date("18 June 2021 16:00 GMT-8"),
      shed_end_time_date: new Date("18 June 2021 19:00 GMT-8"),
      peak_oat: 116.366,
      event_avg_oat: 113.9792692,
      peak_demand_intensity_wft2: 3.065805033,
      shed_avg_wft2: 0.467167165,
    },
    {
      event_id: 12,
      event_date: new Date("20 July 2021"),
      shed_start_time_date: new Date("20 July 2021 15:00 GMT-8"),
      shed_end_time_date: new Date("20 July 2021 17:00 GMT-8"),
      peak_oat: 105.656,
      event_avg_oat: 105.4145,
      peak_demand_intensity_wft2: 2.766230683,
      shed_avg_wft2: 0.46029225,
    },
    {
      event_id: 13,
      event_date: new Date("02 August 2021"),
      shed_start_time_date: new Date("02 August 2021 17:00 GMT-8"),
      shed_end_time_date: new Date("02 August 2021 20:00 GMT-8"),
      peak_oat: 107.654,
      event_avg_oat: 105.5846923,
      peak_demand_intensity_wft2: 2.785696069,
      shed_avg_wft2: 0.409972276,
    },
    {
      event_id: 14,
      event_date: new Date("04 August 2021"),
      shed_start_time_date: new Date("04 August 2021 16:00 GMT-8"),
      shed_end_time_date: new Date("04 August 2021 19:00 GMT-8"),
      peak_oat: 112.73,
      event_avg_oat: 111.299,
      peak_demand_intensity_wft2: 2.958606838,
      shed_avg_wft2: 0.636268078,
    },
    {
      event_id: 15,
      event_date: new Date("05 August 2021"),
      shed_start_time_date: new Date("05 August 2021 16:00 GMT-8"),
      shed_end_time_date: new Date("05 August 2021 19:00 GMT-8"),
      peak_oat: 107.366,
      event_avg_oat: 106.4369231,
      peak_demand_intensity_wft2: 2.776324944,
      shed_avg_wft2: 0.50538691,
    },
  ],
});

const siteT0950 = new BenchmarkingModel({
  coordinates: [-112.074, 33.4484],
  siteID: "T0950",
  siteInfo: {
    doe_climate_zone: "2B",
    city: "Phoenix",
    state: "AZ",
    zip: 85018,
    number_of_floor: 1,
    total_building_area_ft2: 122482,
    net_selling_area_ft2: 79393,
    total_stock_area_ft2: 15561,
    number_of_HVAC: 20,
    program: "SRP Business Demand Response",
    utility: "Salt River Project/80062",
  },

  fieldMetricBaselineRegression: [
    // TODO: add data
  ],
});

const siteT2365 = new BenchmarkingModel({
  coordinates: [-111.6377, 33.2486],
  siteID: "T2365",
  siteInfo: {
    doe_climate_zone: "2B",
    city: "Queen Creek",
    state: "AZ",
    zip: 85142,
    number_of_floor: 1,
    total_building_area_ft2: 177961,
    net_selling_area_ft2: 96354,
    total_stock_area_ft2: 27727,
    number_of_HVAC: 23,
    program: "SRP Business Demand Response",
    utility: "Salt River Project/80062",
  },

  fieldMetricBaselineRegression: [
    // TODO: add data
  ],
});

// siteT0363.save();
// siteT0950.save();
// siteT2365.save();

// add or update a site
async function addOrUpdateSite(siteData) {
  try {
    await BenchmarkingModel.findOneAndUpdate(
      { siteID: siteData.siteID }, // find a document with the same siteID
      siteData,
      { upsert: true, new: true } // upsert and return the new document
    );
  } catch (error) {
    console.error("Error adding/updating site:", error);
  }
}

async function removeDuplicateSites() {
  try {
    const duplicates = await BenchmarkingModel.aggregate([
      {
        $group: {
          _id: { siteID: "$siteID" },
          count: { $sum: 1 },
          ids: { $addToSet: "$_id" },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ]);

    const deletePromises = duplicates.map(async (duplicate) => {
      // Keep one document (the first one) and delete the rest
      const [keepId, ...deleteIds] = duplicate.ids;

      await BenchmarkingModel.deleteMany({ _id: { $in: deleteIds } });
    });

    await Promise.all(deletePromises);

    console.log("Duplicate items removed successfully");
  } catch (error) {
    console.error("Error removing duplicate items:", error);
  }
}

// add data to database
router.get("/add", async (req, res) => {
  await addOrUpdateSite(siteT0363);
  await addOrUpdateSite(siteT0950);
  await addOrUpdateSite(siteT2365);
  res.send("Sites added/updated").status(200);
});

// add remove duplicate sites
router.get("/removeDuplicates", async (req, res) => {
  await removeDuplicateSites();
  res.send("Duplicate sites removed").status(200);
});

router.get("/getAll", async (req, res) => {
  const result = await BenchmarkingModel.find();
  res.send(result).status(200);
});

router.get("/:siteID", async (req, res) => {
  const siteID = req.params.siteID;

  try {
    const result = await BenchmarkingModel.findOne({ siteID: siteID });

    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: "Site not found" });
    }
  } catch (error) {
    console.error("Error retrieving site:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
