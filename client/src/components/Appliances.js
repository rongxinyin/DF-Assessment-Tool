import React, { useState, useEffect, useRef } from "react"; //NEW
import { getBrands, getModels, getWaterHeaterBrands, getWaterHeaterModels } from '../logic/ACFunctions.js';
import {
    Select,
    MenuItem,
    Box,
    Grid,
} from '@mui/material';
import { DropDownIcon } from './DropDownIcon.js';
import { BackButton, NextButton, BreadcrumbNav } from './NavButtons.js';
import { useLocation } from 'react-router-dom';


export default function ApplianceSelector() {
    //previous page info (if not empty/if needed)
    const location = useLocation();
    const inputs = location.state || {};
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
        const loadBrands = async () => {
            if (!form.appliance) return;

            const fetchedBrands =
                form.appliance === "Water heater"
                ? await getWaterHeaterBrands()
                : await getBrands();

            setBrands (fetchedBrands);
        };
        loadBrands();
    }, [form.appliance]);

    /* useEffect(() => {
        const preloadModels = async () => {
            if (form.brand) {
                const loadedModels = await getModels(form.brand);
                setModels(loadedModels);

                if (form.model)
                    for (const model of loadedModels)
                        if (model.model === form.model)
                            setModelData(model);
            }
        };
        preloadModels();
    }, [form.brand]); */

    //NEW
    //handle changes for appliance, brand, and model
    const handleChange = async (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        if (name === "brand") {
            if (value === "Select a brand") {
                setModels([]);
            } else {
                if (brandModels.current.has(value)) {
                    setModels(brandModels.current.get(value));
                } else {
                    const models =
                        form.appliance === "Water heater"
                        ? await getWaterHeaterModels(value)
                        :await getModels(value);
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
                                    <option value="">Choose appliance</option>
                                    <option value="Air conditioner">Air conditioner</option>
                                    <option value="Water heater">Water heater</option>
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
                        flex: 1,
                        padding: "2rem",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}
                >
                    <h2 style={{ fontSize: "2rem", textAlign: "center" }}>Preview</h2>
                    <Grid container marginTop={2} spacing={4}>
                        <Grid item xs={12} md={4}>
                            <img
                                src="/appliance-images/appliance1.png"
                                alt={form.appliance + ' image'}
                                style={{
                                    maxWidth: "100%",
                                    objectFit: "cover",
                                    margin: "auto",
                                    display: "block"
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={8}>
                            {modelData ? (
                                <Box
                                    sx={{
                                        backgroundColor: "#fff",
                                        padding: 2,
                                        borderRadius: "8px",
                                        width: "100%",
                                        boxShadow: 1,
                                    }}
                                >
                                    <table style={{
                                        width: "100%",
                                        borderCollapse: "collapse",
                                        textAlign: "left",
                                        fontSize: "1rem"
                                    }}>
                                        <thead>
                                            <tr style={{ borderBottom: "2px solid #ccc" }}>
                                                <th style={{ padding: "8px" }}>Property</th>
                                                <th style={{ padding: "8px" }}>Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td style={{ padding: "8px" }}>Model</td>
                                                <td style={{ padding: "8px" }}>{modelData.model}</td>
                                            </tr>

                                            {form.appliance === "Air conditioner" && (
                                            <>
                                                <tr>
                                                <td style={{ padding: "8px" }}>Capacity</td>
                                                <td style={{ padding: "8px" }}>{modelData.capacity.toLocaleString()} Btu/h</td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: "8px" }}><abbr title="Coefficient of performance">COP</abbr></td>
                                                <td style={{ padding: "8px" }}>{modelData.cop}</td>
                                            </tr>
                                            </>
                                            )}
                                        </tbody>
                                    </table>
                                </Box>
                            ) : (
                                //error message
                                <div style={{ marginTop: "2rem" }}>Please select a model to see details.</div>
                            )}
                        </Grid>
                    </Grid>

                    <NextButton
                        disabled={!form.model}
                        state={{
                            ...inputs,
                            ...form,
                        }}
                        path="/residential/calculation"                    >
                        Next
                    </NextButton>
                </div>
            </div>
        </div>
    );
}
