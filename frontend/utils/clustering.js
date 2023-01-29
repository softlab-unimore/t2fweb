import axios from 'axios';
import { API_BASE_URL, CLUSTERING_ENDPOINT } from '../constants/config';

export default function handleCluster(ts_feat, n_clusters=4, model_type='Hierarchical', transform_type='minmax', callback) {
    axios(`${API_BASE_URL}${CLUSTERING_ENDPOINT}`, {
        withCredentials: true,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: {'data': ts_feat, 'n_clusters': n_clusters, model_type, transform_type}
    }).then((r) => {
        const response = {};
        response.serverData = r.data;
        response.data = response.server_data;
        console.log(response)
        callback(response);
    }).catch((e) => {
        console.log(e);
        alert(e);
    })
}
