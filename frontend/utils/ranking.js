import axios from 'axios';
import { API_BASE_URL, RANKING_ENDPOINT } from '../constants/config';

export default function handleRanking(ts_feat, pivot_idx, preds, callback) {
    const data = {'data': ts_feat, 'preds': preds, 'idx': pivot_idx};

    axios(`${API_BASE_URL}${RANKING_ENDPOINT}`, {
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
