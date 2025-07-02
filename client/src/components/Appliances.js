import React, { useState } from "react";

export default function ApplianceSelector() {
  const [form, setForm] = useState({
    appliance: "",
    brand: "",
    model: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
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
        {/* Left Panel */}
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

            <div>
              <label style={labelStyle}>Select Appliance:</label>
              <select
                name="appliance"
                value={form.appliance}
                onChange={handleChange}
                style={selectStyle}
              >
                <option value="">-- Choose Appliance --</option>
                <option value="airConditioner">Air Conditioner</option>
                <option value="waterHeater">Water Heater</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Brand</label>
                <select
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  style={selectStyle}
                >
                  <option value="">-- Brand --</option>
                  <option value="brandA">Brand A</option>
                  <option value="brandB">Brand B</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Model</label>
                <select
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  style={selectStyle}
                >
                  <option value="">-- Model --</option>
                  <option value="modelA">Model A</option>
                  <option value="modelB">Model B</option>
                </select>
              </div>
            </div>
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

        {/* Right Panel - Images */}
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
            <img src="/images/Modern-air-conditioning-PNG-1.png" alt="Appliance 1" style={imgStyle} />
            <img src="/images/appliance2.png" alt="Appliance 2" style={imgStyle} />
            <img src="/images/appliance3.png" alt="Appliance 3" style={imgStyle} />
            <img src="/images/appliance4.png" alt="Appliance 4" style={imgStyle} />
            <img src="/images/appliance5.png" alt="Appliance 5" style={imgStyle} />
            <img src="/images/appliance6.png" alt="Appliance 6" style={imgStyle} />
            <img src="/images/appliance7.png" alt="Appliance 7" style={imgStyle} />
            <img src="/images/appliance8.png" alt="Appliance 8" style={imgStyle} />
            <img src="/images/appliance9.png" alt="Appliance 9" style={imgStyle} />
            <img src="/images/appliance10.png" alt="Appliance 10" style={imgStyle} />
            <img src="/images/appliance11.png" alt="Appliance 11" style={imgStyle} />
            <img src="/images/appliance12.png" alt="Appliance 12" style={imgStyle} />
            <img src="/images/appliance13.png" alt="Appliance 13" style={imgStyle} />
            <img src="/images/appliance14.png" alt="Appliance 14" style={imgStyle} />
            <img src="/images/appliance15.png" alt="Appliance 15" style={imgStyle} />
            <img src="/images/appliance16.png" alt="Appliance 16" style={imgStyle} />
            <img src="/images/appliance17.png" alt="Appliance 17" style={imgStyle} />
            <img src="/images/appliance18.png" alt="Appliance 18" style={imgStyle} />
            <img src="/images/appliance19.png" alt="Appliance 19" style={imgStyle} />
            <img src="/images/appliance20.png" alt="Appliance 20" style={imgStyle} />
            <img src="/images/appliance21.png" alt="Appliance 21" style={imgStyle} />
            <img src="/images/appliance22.png" alt="Appliance 22" style={imgStyle} />
            <img src="/images/appliance23.png" alt="Appliance 23" style={imgStyle} />
            <img src="/images/appliance24.png" alt="Appliance 24" style={imgStyle} />
            <img src="/images/appliance25.png" alt="Appliance 25" style={imgStyle} />
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
