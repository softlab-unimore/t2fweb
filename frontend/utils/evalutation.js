import axios from 'axios';
import { API_BASE_URL, EVALUATION_ENDPOINT } from '../constants/config';

export default function handleEvaluation(preds, labels, callback) {
    axios(`${API_BASE_URL}${EVALUATION_ENDPOINT}`, {
        withCredentials: true,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {'preds': preds, 'labels': labels}
    }).then((r) => {
        const response = r.data;
        console.log(response)
        callback(response);
    }).catch((e) => {
        console.log(e);
        alert(e);
    })
}
