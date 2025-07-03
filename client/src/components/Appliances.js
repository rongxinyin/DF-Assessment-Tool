import React, { useState, useEffect } from "react";
import { getBrands, getModels, calculateDR } from '../logic/ACFunctions.js';
import {
    Select,
    MenuItem,
    Button
} from '@mui/material';
import { DropDownIcon } from './DropDownIcon.js';

export default function ApplianceSelector() {
  const [form, setForm] = useState({
    appliance: "",
    brand: "",
    model: "",
  });

  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);

   // Fetch brands off of main function
    useEffect(() => {
        if (brands.length === 0)
            getBrands().then(setBrands);
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
  const textFieldInputPropsSX = {
          sx: {
              color: "#000000",
          },
      };

        const textFieldSX = {
          width: "100%",
          marginBottom: 1,
          marginTop: 1,
          backgroundColor: "white",
          //matching it since MUI makes this one not the same as the other border thicknesess
          "& .MuiOutlinedInput-root": {
            borderRadius: "0px",
            padding: 0,
            "& fieldset": {
              border: "0.5px solid #636365",
              borderRadius: "0px",
            },
            "&:hover fieldset": {
              border: "0.8px solid #000000",
            },
            "&.Mui-focused fieldset": {
              border: "0.8px solid #000000",
            },
            "& .MuiSelect-select": {
              padding: "0rem",
            },
          },
        };


  const inputStyle = {
    width: "100%",
    padding: "1rem",
    borderRadius: "0px",
    border: "0.5px solid #636363",
    backgroundColor: "#FFFFFF",
    color: "#000000",
    fontSize: "1.1rem",
    outline: "none",
    marginBottom: "1rem",
  };

  const selectStyle = {
    ...inputStyle,
    appearance: "none",
  };

  const labelStyle = {
    fontWeight: "bold",
    marginBottom: "0.3rem",
    display: "block",
    fontSize: "1rem",
  };

  const buttonStyle = {
    backgroundColor: "#FFFFFF",
    color: "#000000",
    fontWeight: "bold",
    border: "none",
    borderRadius: "0px",
    padding: "0.8rem 2rem",
    fontSize: "1rem",
    cursor: "pointer",
    minWidth: "100px",
  };

  const nextButtonStyle = {
      backgroundColor: "#FFFFFF",
      color: "#000000",
      fontWeight: "bold",
      border: "0.5px solid #636363",
      borderRadius: "0px",
      padding: "0.8rem 2rem",
      fontSize: "1rem",
      cursor: "pointer",
      minWidth: "100px",

    };

    const backButtonStyle = {
          backgroundColor: "#FFFFFF",
          color: "#000000",
          fontWeight: "bold",
          border: "0.5px solid #636363",
          borderRadius: "0px",
          padding: "0.8rem 2rem",
          fontSize: "1rem",
          cursor: "pointer",
          minWidth: "100px",

        };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", flex: 1 }}>

        {/* left side */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            color: "#000000",
            flex: 1,
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2 style={{ marginBottom: "2rem", fontSize: "2rem" }}>Appliances</h2>
            <form>
            <div>
              <label style={labelStyle}>Select Appliance:</label>
              <select
                name="appliance"
                value={form.appliance}
                onChange={handleChange}
                style={selectStyle}
              >
                <option value="">Choose Appliance</option>
                <option value="airConditioner">Air Conditioner</option>
                <option value="waterHeater">Water Heater</option>
              </select>
            </div>
            <div>
                <label style={{ color: "#000000" }}>Temperature Set Point (°F)</label>
                <input
                    type="number"
                    name="tempSetPoint"
                    value={form.tempSetPoint || ""}
                    onChange={handleChange}
                    style={{ ...inputStyle, backgroundColor: "#FFFFFF" }}
                />
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Brand</label>
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

              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Model</label>
                <Select
                    name="model"
                    disabled={!form.brand}
                    value={form.model || "Select a model"}
                    onChange={handleChange}
                    sx={textFieldSX}
                    inputProps={textFieldInputPropsSX}
                    IconComponent={DropDownIcon}
                    >
                    <MenuItem value="Select a model">Select a model</MenuItem>
                    {models.map(model => (
                        <MenuItem value={model}>{model}</MenuItem>
                    ))}
                </Select>
              </div>
            </div>
            </form>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "2rem",
            }}
          >
            <button style={backButtonStyle}>Back</button>
            <button style={nextButtonStyle}>Next</button>
          </div>

        </div>

        {/* right side images */}
        <div
          style={{
            backgroundColor: "#EEEEEE",
            flex: 1.2,
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h2 style={{ fontSize: "2rem", marginBottom: "2rem" }}>Preview</h2>
          <div
//            style={{
//              display: "flex",
//              justifyContent: "center",
//              alignItems: "center",
//              width: "100%",
//              height: "300px",
//              border: "1px solid #ccc",
//              borderRadius: "10px",
//              backgroundColor: "#f9f9f9",
//            }}
          >
            <img
              src="/appliance-images/appliance1.png"
              alt="Appliance 1"
              style={imgStyle}
            />
          </div>

        </div>

      </div>
    </div>
  );
}

const imgStyle = {
  width: "800px",
  height: "900px",
  borderRadius: "0px",
  objectFit: "cover",
};
