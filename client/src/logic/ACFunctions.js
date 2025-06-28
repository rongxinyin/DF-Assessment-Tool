import axios from 'axios';

export const getBrands = async () => {
    const res = await axios.get('http://localhost:8080/residential/ac/brands');
    return res.data;
};

export const getModels = async brand => {
    const res = await axios.get('http://localhost:8080/residential/ac/brands/' + brand);
    return res.data;
}

export const calculateDR = async form => {
    const res = await axios.get(`http://localhost:8080/residential/ac/brands/${form.brand}/${form.model}/${form.zip}`);
    return res.data;
};
