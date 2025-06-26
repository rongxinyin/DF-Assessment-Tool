import React, { useState } from "react";

export default function BasicCalculator() {
  const [form, setForm] = useState({});

  // function to handle changes in input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // style for input and select fields
  const inputStyle = {
    width: "100%",
    padding: "0.6rem 0.75rem",
    borderRadius: "10px",
    border: "2px solid white",
    backgroundColor: "#00858C",
    color: "white",
    fontSize: "1rem",
  };

  const selectStyle = {
    ...inputStyle,
    appearance: "auto",
  };

  // return what user sees
  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* left panel (inputs) */}
      <div style={{ backgroundColor: "#003840", color: "white", flex: 1, padding: "2rem" }}>

        {/* basic/advanced buttons */}
         <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <button style={{ backgroundColor: "#007b83", border: "none", padding: "0.5rem 1rem", color: "white", borderRadius: "5px" }}>BASIC</button>
          <button style={{ backgroundColor: "#007b83", border: "none", padding: "0.5rem 1rem", color: "white", borderRadius: "5px" }}>ADVANCED</button>
        </div>

        {/* page title */}
        <h2 style={{ marginBottom: "1rem" }}>Basic Calculator</h2>

        {/* input field for baseline power usage */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label>Baseline kW: </label>
            <input
              type="number"
              name="baselineKW"
              value={form.baselineKW || ""}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          {/* input field for demand response power usage */}
          <div>
            <label>DR kW: </label>
            <input
              type="number"
              name="drKW"
              value={form.drKW || ""}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          {/* input field for size of the building in square feet */}
          <div>
            <label>Square Footage:</label>
            <input
              type="number"
              name="sqft"
              value={form.sqft || ""}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          {/* dropdown for HVAC Type */}
          <div>
            <label>HVAC Type:</label>
            <select
              name="hvacType"
              value={form.hvacType || ""}
              onChange={handleChange}
              style={selectStyle}
            >
              <option value="">Select HVAC Type</option>
              <option value="central">Central</option>
              <option value="split">Split</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>
      </div>

      {/* right panel - visualizations */}
      <div style={{ backgroundColor: "#cbe9f5", flex: 1, padding: "2rem" }}>
        <h2 style={{ textAlign: "center" }}>Visualizations</h2>
      </div>
    </div>
  );
}
