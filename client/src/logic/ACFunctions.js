import axios from 'axios';

export const getBrands = async () => {
    const res = await axios.get('http://localhost:8080/residential/ac/brands');
    return res.data;
};

export const getModels = async brand => {
    const res = await axios.get('http://localhost:8080/residential/ac/brands/' + brand);
    return res.data;
}

export const calculateDR = async input => {
    const res = await axios.get(`http://localhost:8080/residential/ac/brands/${input.brand}/${input.model}/${input.zip},${input.normalSetpoint},${input.drSetpoint},${input.timeStart},${input.timeEnd}`);
    return res.data;
};

export const getTemps = async zip => {
    const res = await axios.get(`http://localhost:8080/residential/temps/${zip}`);
    return res.data;
};
