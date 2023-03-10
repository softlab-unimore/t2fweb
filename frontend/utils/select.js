import axios from 'axios';
import { API_BASE_URL, SELECTION_ENDPOINT } from '../constants/config';

export default function handleSelect(ts_feat, model_type, transform_type, labels, callback, nSlice) {
    const data = {'data': ts_feat, model_type, transform_type};
    if (labels) {
        data.labels = labels;
    }

    axios(`${API_BASE_URL}${SELECTION_ENDPOINT}`, {
        withCredentials: true,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data,
    }).then((r) => {
        const response = r.data;
        response.serverData = [...r.data];
        callback(response);
    }).catch((e) => {
        console.log(e);
        alert(e);
    })
}
