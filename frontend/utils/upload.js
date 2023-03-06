import axios from 'axios';
import { API_BASE_URL, READER_ENDPOINT } from '../constants/config';

export default function handleUpload(files, callback, nClass = 0) {
    let fd = new FormData();
    files.map((file) => {
        fd.append('file', file);
    });

    axios(`${API_BASE_URL}${READER_ENDPOINT}`, {
        withCredentials: true,
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data: fd
    }).then((r) => {
        const response = r.data;
        response.serverData = {...r.data};
        response.rawLabels = [...response.labels];
        if (response.labels.length > 0 && nClass > 0) {
            const counterObj = {};
            const dataToVisualize = [];
            const labelsToVisualize = [];

            response.labels.forEach((l, i) => {
                counterObj[l] = counterObj[l] || 0;
                if (counterObj[l] < nClass) {
                    counterObj[l] += 1;
                    dataToVisualize.push(response.data[i]);
                    labelsToVisualize.push(l);
                }
            })
            
            response.data = dataToVisualize;
            response.labels = labelsToVisualize;
        }

        localStorage.setItem('timeseries_data', JSON.stringify(response));

        callback(response);
    }).catch((e) => {
        console.log(e);
        alert(e);
    })
}
