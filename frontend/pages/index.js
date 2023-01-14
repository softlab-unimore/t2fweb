import React, { useEffect, useState } from 'react';
import Dropzone from '../components/Dropzone';
// import LineChart from '../components/LineChart';
import handleUpload from '../utils/upload';
import dynamic from "next/dynamic"

const LineChart = dynamic(() => import("../components/LineChart"), {
    // Do not import in server side
    ssr: false,
  })

export default function index() {
    const [timeseries, setTimeseries] = useState([]);

    const onDrop = (files) => {
        handleUpload(files, setTimeseries);
    }

    return (
        <>
            <Dropzone onDropFn={onDrop} />
            <LineChart timeserie={timeseries.data ? timeseries.data[0] : []} />
        </>
    );
}