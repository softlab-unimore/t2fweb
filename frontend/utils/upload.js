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
        callback(r.data);
    }).catch((e) => {
        console.log(e);
        alert(e);
    })
}
