import React, { useState, useEffect } from "react";
import {
    Select,
    MenuItem,
    Button
} from '@mui/material';
import { ArrowDropDown } from '@mui/icons-material';
import {
  getBrands,
  getModels,
  calculateDR,
  getWaterHeaterBrands,
  getWaterHeaterModels,
  calculateWaterHeaterDR
} from '../logic/ACFunctions.js';




const textFieldSX = {
  '& .MuiInputBase-root': {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
  },
};

const textFieldInputPropsSX = {
  sx: {
    padding: '10px 14px',
  },
};

const DropDownIcon = props => (<ArrowDropDown {...props} style={{ color: 'white' }} />);

export default function ResidentialLanding() {
    const [form, setForm] = useState({});
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [whBrands, setWhBrands] = useState([]);
    const [whModels, setWhModels] = useState([]);
    const [whForm, setWhForm] = useState({});
    const [whResults, setWhResults] = useState(null);
    const [acResults, setAcResults] = useState(null);


    // Fetch brands off of main function
    useEffect(() => {
        if (brands.length === 0)
            getBrands().then(setBrands);
        if (whBrands.length === 0) getWaterHeaterBrands().then(setWhBrands);

    }, []);

    const brandModels = new Map();

    // function to handle changes in input fields
    const handleChange = async (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        if (name === "brand") {
            if (value === "Select a brand")
                setModels([]);
            else {
                if (brandModels.has(value))
                    setModels(brandModels.get(value));
                else {
                    const models = await getModels(value);
                    brandModels.set(value, models);
                    setModels(models);
                }
            }
        }
    };

    const whBrandModels = new Map();

    const handleWhChange = async (e) => {
      const { name, value } = e.target;
      setWhForm({ ...whForm, [name]: value });

      if (name === "brand") {
        if (value === "Select a brand") setWhModels([]);
        else {
          if (whBrandModels.has(value)) setWhModels(whBrandModels.get(value));
          else {
            const ms = await getWaterHeaterModels(value);
            whBrandModels.set(value, ms);
            setWhModels(ms);
          }
        }
      }
    };


    const submitInputs = async () => {
        const results = await calculateDR(form);
        console.log(results)
    };

    const submitWaterHeaterInputs = async () => {
      try {
        const results = await calculateWaterHeaterDR(whForm);
        console.log("Water Heater results:", results);
        setWhResults(results);
      } catch (error) {
        console.error("Error calculating Water Heater:", error);
      }
    };




    const formControlSX = {
        width: "90%",
        marginBottom: 1,
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

                {/* page title */}
                <h2 style={{ marginBottom: "1rem" }}>Residential Calculator</h2>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    {/* input field for size of the building in square feet */}
                    <div>
                        <label>Home Area (ft²)</label>
                        <input
                            type="number"
                            name="sqft"
                            value={form.sqft || ""}
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label>ZIP Code</label>
                        <input
                            type="number"
                            name="zip"
                            value={form.zip || ""}
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label>AC Brand</label>
                        <Select
                            name="brand"
                            value={form.brand || "Select a brand"}
                            onChange={handleChange}
                            sx={textFieldSX}
                            inputProps={textFieldInputPropsSX}
                            IconComponent={DropDownIcon}
                        >
                            <MenuItem value="Select a brand">Select a brand</MenuItem>
                            {brands.map(brand => (
                                <MenuItem value={brand}>{brand}</MenuItem>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <label>AC Model</label>
                        <Select
                            name="model"
                            disabled={!form.brand}
                            value={form.model || "Select a model"}
                            onChange={handleChange}
                            sx={textFieldSX}
                            inputProps={textFieldInputPropsSX}
                            IconComponent={form.brand ? DropDownIcon : ArrowDropDown}
                        >
                            <MenuItem value="Select a model">Select a model</MenuItem>
                            {models.map(model => (
                                <MenuItem value={model}>{model}</MenuItem>
                            ))}
                        </Select>
                    </div>

                    <div>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={submitInputs}
                            sx={{
                                marginTop: 2,
                                marginBottom: 3,
                                width: "25%",
                                height: "50px",
                            }}
                        >
                            Calculate
                        </Button>
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
