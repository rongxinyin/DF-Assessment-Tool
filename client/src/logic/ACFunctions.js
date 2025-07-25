import axios from 'axios';

export const getACBrands = async () => {
    const res = await axios.get('http://localhost:8080/residential/ac/brands');
    return res.data;
};

export const getACModels = async brand => {
    const res = await axios.get('http://localhost:8080/residential/ac/brands/' + brand);
    return res.data;
}

export const calculateACDR = async (input) => {
    const url = `http://localhost:8080/residential/ac/brands/${input.brand}/${input.model}/${input.zip},${input.normalSetpoint},${input.drSetpoint},${input.timeStart},${input.timeEnd},${input.apartmentCount}`;
    const res = await axios.get(url);
    return res.data;
};


export const calculateWaterHeaterDR = async (input) => {
    const url = `http://localhost:8080/residential/water_heaters/${input.brand}/${input.model}/${input.normalSetpoint},${input.drSetpoint},${input.timeStart},${input.timeEnd},${input.apartmentCount}`;
    const res = await axios.get(url);
    return res.data;
};


export const getTemps = async zip => {
    const res = await axios.get(`http://localhost:8080/residential/temps/${zip}`);
    return res.data;
};

export const getZipState = async (zip) => {
    const response = await fetch(`http://localhost:8080/residential/zip-states/${zip}`);
    if (!response.ok) throw new Error('Invalid ZIP code or server error');
    return response.json();
};

export const getClimateZone = async (zip) => {
    try {
        const response = await fetch(`http://localhost:8080/residential/climate-zone/${zip}`);
        if (!response.ok) {
            const text = await response.text();
            console.error('Response error:', response.status, text);
            throw new Error(`Invalid ZIP code or server error: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
};

export const getWaterHeaterBrands = async () => {
    const res = await axios.get('http://localhost:8080/residential/water_heaters');
    return res.data;
};

export const getWaterHeaterModels = async brand => {
    const res = await axios.get('http://localhost:8080/residential/water_heaters/' + brand);
    return res.data;
}
