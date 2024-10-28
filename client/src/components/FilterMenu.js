import React, { useState } from "react";
import {
  Checkbox,
  TextField,
  FormControlLabel,
  Typography,
  Collapse,
  Box,
} from "@mui/material";

const FilterMenu = ({ filters, setFilters }) => {
  const [showBuildingType, setShowBuildingType] = useState(false);
  const [showClimateZone, setShowClimateZone] = useState(false);
  const [showControlStrategy, setShowControlStrategy] = useState(false);

  const handleFilterChange = (event) => {
    const { name, checked } = event.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: checked }));
  };

  return (
    <Box
      sx={{
        width: 300,
        padding: 2,
        bgcolor: "#f5f5f5",
        borderRadius: 2,
        marginTop: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Data Filters
      </Typography>

      <Typography
        variant="subtitle1"
        onClick={() => setShowBuildingType(!showBuildingType)}
        sx={{ cursor: "pointer" }}
      >
        Building Type
      </Typography>
      <Collapse in={showBuildingType}>
        <Box sx={{ ml: 2 }}>
          {["Office", "Retail", "Education", "Others"].map((type) => (
            <FormControlLabel
              key={type}
              control={
                <Checkbox
                  name={type.toLowerCase()}
                  checked={filters[type.toLowerCase()]}
                  onChange={handleFilterChange}
                />
              }
              label={type}
            />
          ))}
        </Box>
      </Collapse>

      <Typography
        variant="subtitle1"
        onClick={() => setShowClimateZone(!showClimateZone)}
        sx={{ cursor: "pointer" }}
      >
        Climate Zone
      </Typography>
      <Collapse in={showClimateZone}>
        <Box sx={{ ml: 2 }}>
          {[
            "CZ 1A Very Hot Humid",
            "CZ 1B Very Hot Dry",
            "CZ 2A Hot Humid",
            "CZ 2B Hot Dry",
            "CZ 3A Warm Humid",
            "CZ 3B Warm Dry",
            "CZ 3C Warm Marine",
            "CZ 4A Mixed Humid",
            "CZ 4B Mixed Dry",
            "CZ 4C Mixed Marine",
            "CZ 5A Cool Humid",
            "CZ 5B Cool Dry",
            "CZ 5C Cool Marine",
            "CZ 6A Cold Humid",
            "CZ 6B Cold Dry",
            "CZ 7 Very Cold",
          ].map((zone) => (
            <FormControlLabel
              key={zone}
              control={
                <Checkbox
                  name={zone}
                  checked={filters[zone]}
                  onChange={handleFilterChange}
                />
              }
              label={zone}
            />
          ))}
        </Box>
      </Collapse>

      <Typography
        variant="subtitle1"
        onClick={() => setShowControlStrategy(!showControlStrategy)}
        sx={{ cursor: "pointer" }}
      >
        Control Strategy
      </Typography>
      <Collapse in={showControlStrategy}>
        <Box sx={{ ml: 2 }}>
          {["HVAC", "Lighting", "Others"].map((strategy) => (
            <FormControlLabel
              key={strategy}
              control={
                <Checkbox
                  name={strategy}
                  checked={filters[strategy]}
                  onChange={handleFilterChange}
                />
              }
              label={strategy}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

export default FilterMenu;
