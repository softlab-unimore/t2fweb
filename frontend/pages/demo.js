import React, { useEffect, useState } from 'react';
import Dropzone from '../components/Dropzone';
import { Button } from '@chakra-ui/react';
import handleUpload from '../utils/upload';
import dynamic from "next/dynamic"
import handleExtraction from '../utils/extraction';
import handleSelect from '../utils/select';
import handleCluster from '../utils/clustering';
import handleEvaluation from '../utils/evalutation';
import BarsChart from '../components/BarChart';

const LineChart = dynamic(() => import("../components/LineChart"), {
    // Do not import in server side
    ssr: false,
  })

export default function index() {
    const [timeseries, setTimeseries] = useState([]);
    const [extraction, setExtraction] = useState([]);
    const [selection, setSelection] = useState([]);
    const [cluster, setCluster] = useState([]);
    const [evaluation, setEvaluation] = useState([]);

    const onDrop = (files) => {
        handleUpload(files, setTimeseries);
    }

    const extractFeatures = () => {
        handleExtraction(timeseries.server_data, 100, 2, setExtraction);
    }

    const selectFeatures = () => {
        handleSelect(extraction.server_data, setSelection);
    }

    const clustering = () => {
        handleCluster(selection, 4, 'Hierarchical', 'minmax', setCluster);
    }

    const getEvaluation = () => {
        handleEvaluation(cluster.server_data, timeseries.labels ? timeseries.labels : cluster.server_data.map((v) => 'x'), setEvaluation);
    }

    return (
        <>
            <Dropzone onDropFn={onDrop} />
            <LineChart timeserie={timeseries.data ? timeseries.data[3] : []} />
            <BarsChart data={cluster.data ? cluster.data : []} />
            <Button onClick={extractFeatures}>extract</Button>
            <Button onClick={selectFeatures}>selection</Button>
            <Button onClick={clustering}>cluster</Button>
            <Button onClick={getEvaluation}>eval</Button>
        </>
    );
}