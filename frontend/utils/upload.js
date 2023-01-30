import axios from 'axios';
import { API_BASE_URL, READER_ENDPOINT } from '../constants/config';

export default function handleUpload(files, callback) {
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
        response.serverData = response.data;
        response.data = (response.data.length > 0) ? response.data.slice(0, 15) : [];
        if (response.labels.length > 0) {
            response.labels.slice(0, 10);
        } else {
            response.labels = response.data.map((v, i) => `Timeserie ${i+1}`);
            response.serverData.labels = response.serverData.map((v, i) => `Timeserie ${i+1}`);
        }

        callback(response);
    }).catch((e) => {
        console.log(e);
        alert(e);
    })
}
