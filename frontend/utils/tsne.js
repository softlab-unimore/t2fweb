import axios from 'axios';
import { API_BASE_URL, TSNE_ENDPOINT } from '../constants/config';

export default function handleTsne(ts_feat, preds, callback) {
    const data = {'data': ts_feat, 'preds': preds};

    axios(`${API_BASE_URL}${TSNE_ENDPOINT}`, {
        withCredentials: true,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data,
    }).then((r) => {
        console.log(r.data);
        callback(r.data);
    }).catch((e) => {
        console.log(e);
        alert(e);
    })
}
