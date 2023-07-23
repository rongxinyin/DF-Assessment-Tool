import axios from "axios";

//Generate caseID based on user inputs
const createCaseIDs = (state, buildingType, buildYear, precool, reset) => {
  let caseIDs = [];
  for (var eventHour = 1; eventHour <= 4; eventHour++) {
    let caseID =
      state +
      "-" +
      buildingType +
      "-" +
      buildYear +
      "-GTA-" +
      precool +
      "-" +
      reset +
      "-" +
      eventHour;
    caseIDs.push(caseID);
  }
  return caseIDs;
};

// Calculates DR percentage and DR (KW) for a given caseID and inputted CSSB data.
const gtaCalculation = async (state, caseIDs, CSSB) => {
  let DR_output = [];

  for (var index = 0; index < 4; index++) {
    let temperature = CSSB[index].avg_temp;
    let demand = CSSB[index].avg_demand;
    let caseID = caseIDs[index];
    let equation = {};

    try {
      const res = await axios.get(
        `http://localhost:8080/states/${state}/loadShedDatabase/${caseID}`
      );

      if (res.data.equations) { //if caseID was valid
        if (temperature <= 75) {
          equation = res.data.equations.find(
            (eq) => eq.temp_category == "pct_OAT<=75"
          );
        } else if (temperature > 75) {
          equation = res.data.equations.find(
            (eq) => eq.temp_category == "pct_75<=OAT<=95"
          );
        }

        let DR_Obj = {};
        DR_Obj["caseID"] = caseID;

        let DR_pct =
          (temperature * equation.equation_slope + equation.equation_intercept) /
          100;
        DR_Obj["DR_PCT"] = DR_pct;

        let DR_kw = demand * DR_pct;
        DR_Obj["DR_KW"] = DR_kw;

        DR_output.push(DR_Obj);

        if (DR_output.length == 4) {
          return DR_output;
        }
      } else { //if caseID was not valid
        return {};
      }
    } catch (err) {
      console.error(err);
    }
  }
};

export { gtaCalculation, createCaseIDs };
