import axios from "axios";

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
    } catch (err) {
      console.error(err);
    }
  }
};

export { gtaCalculation };
