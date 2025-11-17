import axios from 'axios';

export const fetchData = async (url: string) => {
    const {data} = await axios.get(url);
    return data;
};
