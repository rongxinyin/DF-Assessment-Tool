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
              color: "#FFFFFF",
          },
      };

      const textFieldSX = {
          width: "100%",
          marginBottom: 1,
          marginTop: 1,
          border: "2px solid #F0F0F0",
          backgroundColor: "secondary.main",
          borderRadius: "10px",
      };

  const inputStyle = {
    width: "100%",
    padding: "1rem",
    borderRadius: "10px",
    border: "2px solid white",
    backgroundColor: "#007b83",
    color: "white",
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
    backgroundColor: "#007b83",
    color: "white",
    fontWeight: "bold",
    border: "none",
    borderRadius: "6px",
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
            backgroundColor: "#003840",
            color: "white",
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
            <button style={buttonStyle}>Back</button>
            <button style={buttonStyle}>Next</button>
          </div>
        </div>

        {/* right side - images */}
        <div
          style={{
            backgroundColor: "#cbe9f5",
            flex: 1.2,
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h2 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Preview</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "1.5rem",
              width: "100%",
            }}
          >
            <img src="/appliance-images/appliance1.png" alt="Appliance 1" style={imgStyle} />
            <img src="/appliance-images/appliance2.png" alt="Appliance 2" style={imgStyle} />
            <img src="/appliance-images/appliance3.png" alt="Appliance 3" style={imgStyle} />
            <img src="/appliance-images/appliance4.png" alt="Appliance 4" style={imgStyle} />
            <img src="/appliance-images/appliance5.png" alt="Appliance 5" style={imgStyle} />
            <img src="/appliance-images/appliance6.png" alt="Appliance 6" style={imgStyle} />
            <img src="/appliance-images/appliance7.png" alt="Appliance 7" style={imgStyle} />
            <img src="/appliance-images/appliance8.png" alt="Appliance 8" style={imgStyle} />
            <img src="/appliance-images/appliance9.png" alt="Appliance 9" style={imgStyle} />
            <img src="/appliance-images/appliance10.png" alt="Appliance 10" style={imgStyle} />
            <img src="/appliance-images/appliance11.png" alt="Appliance 11" style={imgStyle} />
            <img src="/appliance-images/appliance12.png" alt="Appliance 12" style={imgStyle} />
            <img src="/appliance-images/appliance13.png" alt="Appliance 13" style={imgStyle} />
            <img src="/appliance-images/appliance14.png" alt="Appliance 14" style={imgStyle} />
            <img src="/appliance-images/appliance15.png" alt="Appliance 15" style={imgStyle} />
            <img src="/appliance-images/appliance16.png" alt="Appliance 16" style={imgStyle} />
            <img src="/appliance-images/appliance17.png" alt="Appliance 17" style={imgStyle} />
            <img src="/appliance-images/appliance18.png" alt="Appliance 18" style={imgStyle} />
            <img src="/appliance-images/appliance19.png" alt="Appliance 19" style={imgStyle} />
            <img src="/appliance-images/appliance20.png" alt="Appliance 20" style={imgStyle} />
            <img src="/appliance-images/appliance21.png" alt="Appliance 21" style={imgStyle} />
            <img src="/appliance-images/appliance22.png" alt="Appliance 22" style={imgStyle} />
            <img src="/appliance-images/appliance23.png" alt="Appliance 23" style={imgStyle} />
            <img src="/appliance-images/appliance24.png" alt="Appliance 24" style={imgStyle} />
            <img src="/appliance-images/appliance25.png" alt="Appliance 25" style={imgStyle} />
          </div>
        </div>
      </div>
    </div>
  );
}

const imgStyle = {
  width: "100%",
  height: "180px",
  borderRadius: "10px",
  objectFit: "cover",
};
