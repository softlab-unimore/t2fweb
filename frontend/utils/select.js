import axios from 'axios';
import { API_BASE_URL, SELECTION_ENDPOINT } from '../constants/config';

export default function handleSelect(ts_feat, callback) {
    axios(`${API_BASE_URL}${SELECTION_ENDPOINT}`, {
        withCredentials: true,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {'data': ts_feat}
    }).then((r) => {
        const response = r.data;
        response.serverData = response;
        if (response.length > 0) {
            response.data = r.data.slice(0, 20);
        }
        console.log(response)
        callback(response);
    }).catch((e) => {
        console.log(e);
        alert(e);
    })
}
