import React, { useEffect, useState } from 'react';
import Dropzone from '../components/Dropzone';
import { Button } from '@chakra-ui/react';
import handleUpload from '../utils/upload';
import dynamic from "next/dynamic"
import handleExtraction from '../utils/extraction';
import handleSelect from '../utils/select';
import handleCluster from '../utils/clustering';
import handleEvaluation from '../utils/evalutation';

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
        handleCluster(selection.server_data, 4, 'Hierarchical', 'minmax', setCluster);
    }

    const getEvaluation = () => {
        handleEvaluation(cluster.server_data, timeseries.labels, setEvaluation);
    }

    return (
        <>
            <Dropzone onDropFn={onDrop} />
            <LineChart timeserie={timeseries.data ? timeseries.data[0] : []} />
            <Button onClick={extractFeatures}>extract</Button>
            <Button onClick={selectFeatures}>selection</Button>
            <Button onClick={clustering}>cluster</Button>
            <Button onClick={getEvaluation}>eval</Button>
        </>
    );
}