import React, { useState, useEffect } from "react";
import { getBrands, getModels } from '../logic/ACFunctions.js';
import {
    Select,
    MenuItem,
    Box
} from '@mui/material';
import { DropDownIcon } from './DropDownIcon.js';
import { BackButton, NextButton , BreadcrumbNav } from './NavButtons.js';

export default function ApplianceSelector() {
    const [form, setForm] = useState({
        appliance: "",
        brand: "",
        model: "",
    });

    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [modelData, setModelData] = useState(null);

    const brandModels = new Map();

    useEffect(() => {
        if (brands.length === 0)
            getBrands().then(setBrands);
    }, [brands.length]);

    const handleChange = async (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        if (name === "brand") {
            if (value === "Select a brand") {
                setModels([]);
            }    
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

    return (
        <div
            style={{
                minHeight: "calc(100vh - 90px)",
                display: "flex",
                flexDirection: "column",
                fontFamily: "sans-serif",
            }}
        >
            <Box sx={{ padding: 2, paddingBottom: 0.5}}>
                <BreadcrumbNav paths={breadcrumbPaths} />
            </Box>
            
            <div style={{ display: "flex", flex: 1 }}>
                {/* Left side */}
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

                    <BackButton path="/residential/location" />
                </div>

                {/* Right side preview image */}
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
                    <h2 style={{ fontSize: "2rem", marginBottom: "2rem" }}>Preview</h2>
                    <img
                        src="/appliance-images/appliance1.png"
                        alt={(form.appliance === 'airConditioner' ? 'Air conditioner' : 'Water heater') + ' image'}
                        style={{
                            width: "60%",
                            objectFit: "cover",
                            margin: "auto",
                            display: "block"
                        }}
                    />

                    <NextButton path="/residential/calculation" disabled={!form.model} />
                </div>
            </div>
        </div>
    );
}    