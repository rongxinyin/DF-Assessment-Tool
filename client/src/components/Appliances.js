import React, { useState, useEffect, useRef } from "react"; //NEW
import { getACBrands, getACModels, getWaterHeaterBrands, getWaterHeaterModels } from '../logic/ACFunctions.js';
import {
    Typography,
    Select,
    MenuItem,
    Box,
    Grid,
    FormControl
} from '@mui/material';
import { BackButton, NextButton, BreadcrumbNav } from './NavButtons.js';
import { useLocation } from 'react-router-dom';
import { rootSX, formControlSX, textFieldSX } from '../App.js';

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
                    : await getACBrands();

            setBrands(fetchedBrands);
        };
        loadBrands();
    }, [form.appliance]);

    //handle changes for appliance, brand, and model
    const handleChange = async (e) => {
        const { name, value } = e.target;
        if (name === "appliance") {
            setForm({ appliance: value });
            setModelData(null);
        }
        else
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
                            : await getACModels(value);
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
        <Box sx={rootSX}>
            <BreadcrumbNav paths={breadcrumbPaths} />

            <Grid container spacing={0} style={{ flex: '1' }}>
                <Grid container item md={6} xs={12}>
                    {/* left side - info input */}
                    <Grid
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
                            <Typography
                                variant="h4"
                                color="black.main"
                                sx={{ fontWeight: 'bold', m: 1 }}
                            >
                                Appliances
                            </Typography>
                            <form>
                                {/*appliance selection dropdown menu*/}
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <FormControl sx={formControlSX}>
                                            <Typography
                                                variant="body2"
                                                color="typography.primary.main"
                                                sx={{ fontWeight: 'bold', marginLeft: 1 }}
                                            >
                                                Appliance type
                                            </Typography>
                                            <Select
                                                name="appliance"
                                                value={form.appliance}
                                                onChange={handleChange}
                                                sx={textFieldSX}
                                            >
                                                <MenuItem value="Air conditioner">Air conditioner</MenuItem>
                                                <MenuItem value="Water heater">Water heater</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    {/*brand+model selector (side by side)*/}
                                    <Grid item xs={6}>
                                        <FormControl sx={formControlSX}>
                                            <Typography
                                                variant="body2"
                                                color="typography.primary.main"
                                                sx={{ fontWeight: "bold", marginLeft: 1 }}
                                            >
                                                Brand
                                            </Typography>
                                            <Select
                                                name="brand"
                                                value={form.brand || "Select a brand"}
                                                onChange={handleChange}
                                                disabled={!form.appliance}
                                                sx={textFieldSX}
                                            >
                                                <MenuItem value="Select a brand">Select a brand</MenuItem>
                                                {brands.map((brand) => (
                                                    <MenuItem key={brand} value={brand}>
                                                        {brand}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    {/*model selector*/}
                                    <Grid item xs={6}>
                                        <FormControl sx={formControlSX}>
                                            <Typography
                                                variant="body2"
                                                color="typography.primary.main"
                                                sx={{ fontWeight: "bold", marginLeft: 1 }}
                                            >
                                                Model
                                            </Typography>
                                            <Select
                                                name="model"
                                                disabled={!form.brand}
                                                value={form.model || "Select a model"}
                                                onChange={handleChange}
                                                sx={textFieldSX}
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
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </form>
                        </div>
                    </Grid>
                </Grid>

                {/* right side */}
                <Grid item container md={6} xs={12}
                    direction="column"
                    style={{
                        backgroundColor: "#EEEEEE",
                        padding: "2rem",
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{ fontWeight: 'bold', m: 1 }}
                    >
                        Preview
                    </Typography>

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

                </Grid>
            </Grid>

            <Box padding={2}>
                <BackButton
                    path="/residential/location"
                    state={inputs}
                />

                <NextButton
                    disabled={!form.model}
                    state={{
                        ...inputs,
                        ...form,
                    }}
                    path="/residential/calculation"                    >
                    Next
                </NextButton>
            </Box>
        </Box >
    );
}
