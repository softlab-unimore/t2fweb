import axios from 'axios';
import { API_BASE_URL, EXTRACTION_ENDPOINT } from '../constants/config';

export default function handleExtraction(ts_list, batch_size=100, p=2, callback) {
    axios(`${API_BASE_URL}${EXTRACTION_ENDPOINT}`, {
        withCredentials: true,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {'data': ts_list, 'batch_size': batch_size, 'p': p}
    }).then((r) => {
        const response = r.data;

        response.serverData = {...r.data};
        if (response.length > 0) {
            response.data = r.data.slice(0, 15);
            response.data[0] = response.data[0] || {};
            response.featuresSelected = Object.keys(response.data[0]).map((v) => { return { [v]: true } })
        }

        callback(response);
    }).catch((e) => {
        console.log(e);
        alert(e);
    })
}
