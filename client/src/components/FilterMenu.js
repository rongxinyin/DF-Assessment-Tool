import React from "react";

const FilterMenu = ({ filters, setFilters }) => {
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  return (
    <div
      style={{ width: "300px", padding: "10px", backgroundColor: "#f0f0f0" }}
    >
      <h3>Building Classification</h3>
      <div>
        <label>
          Residential and Mixed Use
          <input
            type="checkbox"
            name="residential"
            checked={filters.residential}
            onChange={handleFilterChange}
          />
        </label>
      </div>
      <div>
        <label>
          Commercial
          <input
            type="checkbox"
            name="commercial"
            checked={filters.commercial}
            onChange={handleFilterChange}
          />
        </label>
      </div>
      <h3>Location & Data Source</h3>
      <div>
        <label>
          City
          <input
            type="text"
            name="city"
            value={filters.city}
            onChange={handleFilterChange}
          />
        </label>
      </div>
      {/* Add more filters as needed */}
    </div>
  );
};

export default FilterMenu;
