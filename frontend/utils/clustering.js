import axios from 'axios';
import { API_BASE_URL, CLUSTERING_ENDPOINT } from '../constants/config';

export default function handleCluster(ts_feat, enabledFeatures, n_clusters=4, model_type='Hierarchical', transform_type='minmax', labels, callback) {
    const data = {'data': ts_feat, 'n_clusters': n_clusters, model_type, transform_type, 'selection': enabledFeatures};
    if (labels) {
        data.labels = labels;
    }

    axios(`${API_BASE_URL}${CLUSTERING_ENDPOINT}`, {
        withCredentials: true,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    }).then((r) => {
        const response = {};
        response.data = r.data;
        callback(response);
    }).catch((e) => {
        console.log(e);
        alert(e);
    })
}
