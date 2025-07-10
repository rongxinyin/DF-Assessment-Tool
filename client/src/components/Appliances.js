import React, { useState, useEffect, useRef } from "react"; //NEW
import { getBrands, getModels } from '../logic/ACFunctions.js';
import {
    Select,
    MenuItem,
    Box,
    Button,
} from '@mui/material';
import { DropDownIcon } from './DropDownIcon.js';
import { BackButton, NextButton, BreadcrumbNav } from './NavButtons.js';
import { useLocation, useNavigate } from 'react-router-dom';


export default function ApplianceSelector() {
//previous page info (if not empty/if needed)
    const location = useLocation();
    const inputs = location.state || {};
    const navigate = useNavigate();
    const [form, setForm] = useState({
        appliance: inputs.appliance || "",
        brand: inputs.brand || "",
        model: inputs.model || "",
    });
//state for available brands+models (dropdowns)
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);

//state for what is selected in brands+models
    const [modelData, setModelData] = useState(null);

//temp storage for brand, models mapping, using useRef (no re renders)
    const brandModels = useRef(new Map()); //NEW
    useEffect(() => {
        if (brands.length === 0)
            getBrands().then(setBrands);
    }, [brands.length]);


    useEffect(() => {
        const preloadModels = async () => {
            if (form.brand) {
                const loadedModels = await getModels(form.brand);
                setModels(loadedModels);
            }
        };
        preloadModels();
    }, [form.brand]);

//NEW
//handle changes for appliance, brand, and model
   const handleChange = async (e) => {
       const { name, value } = e.target;
       setForm(prev => ({ ...prev, [name]: value }));

       if (name === "brand") {
           if (value === "Select a brand") {
               setModels([]);
           } else {
               if (brandModels.current.has(value)) {
                   setModels(brandModels.current.get(value));
               } else {
                   const models = await getModels(value);
                   brandModels.current.set(value, models);
                   setModels(models);
               }
           }
           setForm(prev => ({ ...prev, model: "" }));
           setModelData(null);
       }

        //reset when brand changes
       if (name === "model") {
           const selectedModel = models.find(m => (typeof m === 'object' ? m.model : m) === value);
           if (selectedModel) {
               setModelData(selectedModel);
           } else {
               setModelData(null);
           }
           //update
           setForm(prev => ({ ...prev, model: value }));
       }
   };

//styles
    const textFieldInputPropsSX = {
        sx: {
            color: "#000000",
        },
    };

    const textFieldSX = {
        width: "100%",
        marginBottom: 1,
        marginTop: 1,
        border: "0.5px solid #636363",
        backgroundColor: "white",
        borderRadius: "10px",
    };

    const inputStyle = {
        width: "100%",
        padding: "1rem",
        borderRadius: "10px",
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

    const breadcrumbPaths = [
        { name: 'House Type', path: '/residential/house_type' },
        { name: 'Location', path: '/residential/location' },
        { name: 'Appliances', path: '/residential/appliances' },
    ];

    return (
        <div
            style={{
                minHeight: "calc(100vh - 90px)",
                display: "flex",
                flexDirection: "column",
                fontFamily: "sans-serif",
            }}
        >
            <Box sx={{ padding: 2, paddingBottom: 0.5 }}>
                <BreadcrumbNav paths={breadcrumbPaths} />
            </Box>

            <div style={{ display: "flex", flex: 1 }}>
                {/* left side - info input */}
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
                        {/*appliance selection dropdown menu*/}
                            <div>
                                <label style={{ fontWeight: "bold", marginBottom: "0.3rem", display: "block", fontSize: "1rem" }}>Select Appliance:</label>
                                <select
                                    name="appliance"
                                    value={form.appliance}
                                    onChange={handleChange}
                                    style={{
                                        width: "100%",
                                        padding: "1rem",
                                        borderRadius: "10px",
                                        border: "0.5px solid #636363",
                                        backgroundColor: "#FFFFFF",
                                        color: "#000000",
                                        fontSize: "1.1rem",
                                        outline: "none",
                                        marginBottom: "1rem",
                                        appearance: "none",
                                    }}
                                >
                                    <option value="">Choose Appliance</option>
                                    <option value="airConditioner">Air Conditioner</option>
                                    <option value="waterHeater">Water Heater</option>
                                </select>
                            </div>
                    {/*brand+model selector (side by side)*/}
                            <div style={{ display: "flex", gap: "1rem" }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontWeight: "bold", marginBottom: "0.3rem", display: "block", fontSize: "1rem" }}>Brand</label>
                                    <Select
                                        name="brand"
                                        value={form.brand || "Select a brand"}
                                        onChange={handleChange}
                                        sx={{
                                            width: "100%",
                                            marginBottom: 1,
                                            marginTop: 1,
                                            border: "0.5px solid #636363",
                                            backgroundColor: "white",
                                            borderRadius: "10px",
                                            color: "#000000",
                                        }}
                                        inputProps={{ sx: { color: "#000000" } }}
                                        IconComponent={DropDownIcon}
                                        disabled={!form.appliance}
                                    >
                                        <MenuItem value="Select a brand">Select a brand</MenuItem>
                                        {brands.map((brand) => (
                                            <MenuItem key={brand} value={brand}>
                                                {brand}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </div>
                            {/*model selector*/}
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontWeight: "bold", marginBottom: "0.3rem", display: "block", fontSize: "1rem" }}>Model</label>
                                    <Select
                                        name="model"
                                        disabled={!form.brand}
                                        value={form.model || "Select a model"}
                                        onChange={handleChange}
                                        sx={{
                                            width: "100%",
                                            marginBottom: 1,
                                            marginTop: 1,
                                            border: "0.5px solid #636363",
                                            backgroundColor: "white",
                                            borderRadius: "10px",
                                            color: "#000000",
                                        }}
                                        inputProps={{ sx: { color: "#000000" } }}
                                        IconComponent={DropDownIcon}
                                    >
                                        <MenuItem value="Select a model">Select a model</MenuItem>
                                        {models.map((model) => (
                                            <MenuItem
                                                key={typeof model === "object" ? model.model : model}
                                                value={typeof model === "object" ? model.model : model}
                                            >
                                                {typeof model === "object" ? model.model : model}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </div>
                            </div>
                        </form>
                    {/*NEW - table*/}

                    {modelData ? (
                        <div style={{ marginTop: "2rem", width: "100%" }}>
                            <table style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                textAlign: "left",
                                fontSize: "1rem"
                            }}>
                                <thead>
                                    <tr style={{ backgroundColor: "#f0f0f0" }}>
                                        <th style={{ padding: "0.75rem", borderBottom: "1px solid #ccc" }}>Property</th>
                                        <th style={{ padding: "0.75rem", borderBottom: "1px solid #ccc" }}>Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: "0.75rem", borderBottom: "1px solid #ccc" }}>Model</td>
                                        <td style={{ padding: "0.75rem", borderBottom: "1px solid #ccc" }}>{modelData.model}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "0.75rem", borderBottom: "1px solid #ccc" }}>Capacity</td>
                                        <td style={{ padding: "0.75rem", borderBottom: "1px solid #ccc" }}>{modelData.capacity}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "0.75rem", borderBottom: "1px solid #ccc" }}>COP</td>
                                        <td style={{ padding: "0.75rem", borderBottom: "1px solid #ccc" }}>{modelData.cop}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    ) : (
                    //error message
                        <div style={{ marginTop: "2rem" }}>Please select a model to see details.</div>
                    )}


                    </div>

                    <BackButton
                        path="/residential/location"
                        state={inputs}
                    />
                </div>

                {/* right side */}
                <div
                    style={{
                        backgroundColor: "#EEEEEE",
                        flex: 1.2,
                        padding: "2rem",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}
                >
                    <h2 style={{ fontSize: "2rem", marginBottom: "2rem", textAlign: "center" }}>Preview</h2>
                    <div
                    >
                        <img
                            src="/appliance-images/appliance1.png"
                            alt={(form.appliance === 'airConditioner' ? 'Air conditioner' : 'Water heater') + ' image'}
                            style={{
                                width: "50%",
                                objectFit: "cover",
                                margin: "auto",
                                display: "block"
                            }}
                        />
                    </div>

                    <Button
                        disabled={!form.model}
                        onClick={() => {
                            navigate("/residential/calculation", {
                                state: {
                                    ...inputs,
                                    ...form,
                                },
                            });
                        }}
                        variant="contained"
                        color="secondary"
                        sx={{
                            marginTop: "2rem",
                            width: "100%",
                            height: "50px",
                        }}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}    
