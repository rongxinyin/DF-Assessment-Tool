import React, { useState } from "react";
import axios from "axios";

export default function ResidentialLanding() {
    const [baselineKW, setBaselineKW] = useState(5.0);
    const [drKW, setDrKW] = useState(3.5);
    const [sqft, setSqft] = useState(1500);

    //coming from backend (energy use, load change, etc)
    const [results, setResults] = useState(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    //sending to backend to get calculations
    const calculate = async () => {
        try {
            const response = await axios.post("http://localhost:5000/calculate", {
                baselineKW, drKW, squareFootage: sqft,
            } );

           //store values
           setResults(response.data);

           setIsPanelOpen(true);
          }

        catch (error){
            console.error("Calculation error:", error);

        }

        };

    //return what user sees
    return (
    <div style={{ height: "100vh", padding: "2rem" }}>
          {/* page title */}
          <h1>Central AC Load Calculator</h1>

     {/* input field for baseline power usage*/}
     <div style={{ marginBottom: "1rem" }}>
             <label>Baseline kW: </label>
             <input
               type="number" // only  numbers
               value={baselineKW}
               onChange={(e) => setBaselineKW(parseFloat(e.target.value))} // update state
             />
           </div>

     {/* input field for demand response power usage*/}
     <div style={{ marginBottom: "1rem" }}>
             <label>DR kW: </label>
             <input
               type="number"
               value={drKW}
               onChange={(e) => setDrKW(parseFloat(e.target.value))}
             />
           </div>


     {/* input field for size of the building in square feet*/}
      <div style={{ marginBottom: "1rem" }}>
             <label>Square Footage: </label>
             <input
               type="number"
               value={sqft}
               onChange={(e) => setSqft(parseInt(e.target.value))}
             />
           </div>

      {/*button to calculate results*/}
      <button onClick = {calculate}>Calculate</button>

      {/*results will only show if we got results from backend and the panel is open*/}
     {isPanelOpen && results && (
             <div
               style={{
                 position: "absolute",
                 bottom: 0,
                 left: 0,
                 right: 0,
                 height: "50%",
                 backgroundColor: "white",
                 padding: "20px",
                 boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.2)",
                 overflowY: "auto",
               }}
             >
     {/* close button (X) to hide or close the panel*/}
               <button
                 onClick={() => setIsPanelOpen(false)}
                 style={{
                   position: "absolute",
                   top: "10px",
                   right: "10px",
                   background: "none",
                   border: "none",
                   fontSize: "1.5em",
                   cursor: "pointer",
                 }}
               >
                 &times; {/* close icon "x" symbol*/}
               </button>

                {/*results are shown here*/}
               <h2>Results</h2>
               <p><strong>Normal Energy Use:</strong> {results.normalUse} kWh</p>
               <p><strong>DR Energy Use:</strong> {results.drUse} kWh</p>
               <p><strong>Load Reduction:</strong> {results.loadKW} kW</p>
               <p><strong>Load Reduction (%):</strong> {results.loadPct} %</p>
               <p><strong>Load Reduction (W/ft²):</strong> {results.loadWPerFt2} W/ft²</p>
             </div>
           )}
         </div>
       );
     }

