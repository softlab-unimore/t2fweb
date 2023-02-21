import axios from 'axios';
import { API_BASE_URL, SPLIT_ENDPOINT } from '../constants/config';

export default function handleSplit(labels, train_size=0.4, callback) {
    axios(`${API_BASE_URL}${SPLIT_ENDPOINT}`, {
        withCredentials: true,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {'labels': labels, 'train_size': train_size}
    }).then((r) => {
        const response = {};
        response.serverData = r.data;
        response.data = r.data;
        console.log(response)
        callback(response);
    }).catch((e) => {
        console.log(e);
        alert(e);
    })
}
