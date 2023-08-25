import React, { useEffect, useState } from 'react';
import {
    Box,
    Heading,
    Text,
    Input,
    Card,
    CardBody,
    CardHeader,
    SimpleGrid,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Container,
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    Checkbox,
    TableContainer,
    Button,
    Select,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Progress,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    Tooltip,
    SliderMark,
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import handleExtraction from '../utils/extraction';
import handleSelect from '../utils/select';
import handleClustering from '../utils/clustering';
import handleEvaluation from '../utils/evalutation';
import handleSplit from '../utils/split';
import handleRanking from '../utils/ranking';

import { useRecoilState } from 'recoil';
import { baseState, labelState, featuresState, featuresSelectedState, selectState, clusteringState } from '../state/index';

import dynamic from "next/dynamic"
import handleTsne from '../utils/tsne';
import ScattersChart from '../components/ScatterChart';
const LineChart = dynamic(() => import("../components/LineChart"), {
    // Do not import in server side
    ssr: false,
})

export default function features() {
    const [{ labels: shortLabel, data, serverData }, setBaseState] = useRecoilState(baseState);
    const [labels, setLabels] = useRecoilState(labelState);
    const [{ features, featureRequestSent }, setFeatures] = useRecoilState(featuresState);
    const [featuresSelected, setFeaturesSelected] = useRecoilState(featuresSelectedState);
    const [select, setSelectState] = useRecoilState(selectState);
    const [clustering, setClusteringState] = useRecoilState(clusteringState);
    const [dataToVisualize, setDataToVisualize] = useState({ data: [], labels: [] });

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [modalTimeserie, setModalTimeserie] = useState({timeserie: [], title: null});

    const [labelTrain, setLabelTrain] = useState([]);
    const [ranking, setRanking] = useState([]);
    const [tsne, setTsne] = useState(null);

    const [labelClusters, setLabelCluster] = useState({});

    const [evaluation, setEvaluation] = useState(undefined);
    const [ncluster, setNcluster] = useState(4);
    const [trainSizeValue, setSliderValue] = useState(30)
    const [showTooltip, setShowTooltip] = React.useState(false)
    const [{ modelType, transformType }, setParams] = useState({ modelType: 'Hierarchical', transformType: 'std' });

    const sportMap = {
        'standing': 0,
        'running': 1,
        'walking': 2,
        'badminton': 3,
    };

    useEffect(() => {
        if (serverData !== undefined && !featureRequestSent) {
            setDataToVisualize({ labels: shortLabel, data: data });
            doExtraction();
        }
    }, []);

    useEffect(() => {
        if (features) {
            updateSelectedFeatures();
        }
    }, [features])

    const doExtraction = () => {
        setFeatures({ features: null });
        handleExtraction(serverData.data, 100, 2, (extractionData) => {
            setFeatures((old) => {
                return {
                    ...old,
                    features: [...Object.values(extractionData.serverData)],
                    featureRequestSent: true
                }
            });

            if (labels.length > 0) {
                handleSplit(labels, trainSizeValue/100, (d) => {
                    setLabelTrain(d.data);
                    console.log(d.data);
                });
            }

            setFeaturesSelected(() => {
                return Object.assign({}, ...extractionData.featuresSelected);
            });
        });
    };

    const onFeatureCheck = (e, i) => {
        const newFeatures = {...featuresSelected};
        newFeatures[i] = e.target.checked;
        setFeaturesSelected((old) => {
            return newFeatures;
        })
    }

    const updateSelectedFeatures = (labelTrainMocked = null) => {
        if (Object.keys(featuresSelected).length === 0) return 0;
        const enabledFeatures = Object.keys(featuresSelected).filter((k) => featuresSelected[k]);
        let requestFeatures = [...Object.values(features)];
        if (enabledFeatures.length !== Object.keys(featuresSelected).length) {
            requestFeatures.map((timeserieFeats) => {
                return Object.fromEntries(Object.entries(timeserieFeats).filter((k) => enabledFeatures.includes(k[0])));
            })
        }

        let labelTrainToUse = labelTrainMocked ? labelTrainMocked : labelTrain;
        const labelTrainData = (Object.values(labelTrainToUse).length > 0) ? Object.fromEntries(Object.entries(labelTrainToUse).filter((k) => k[0] <= dataToVisualize.labels.length-1)) : null;
        handleSelect(requestFeatures, modelType, transformType, labelTrainData, (data) => { setSelectState(data); console.log(data)}, dataToVisualize.labels.length);
    };

    const onClustering = () => {
        if (labels && labels.length > 0) {
            handleSplit(labels, trainSizeValue/100, (d) => setLabelTrain(d.data));
            if (select) {
                doClustering();
            }
        } else {
            let mappedClusterSport = {};
            const labelClusterKeys = Object.keys(labelClusters);
            Object.values(labelClusters).map((c, i) => { mappedClusterSport[labelClusterKeys[i]] = parseInt(sportMap[c.trim().toLowerCase()]); });
            setLabelTrain(mappedClusterSport);

            updateSelectedFeatures(mappedClusterSport);

            setTimeout(() => {
                doClustering();
            }, 6000);
        }
    };

    const doClustering = () => {
        const labelTrainData = (Object.values(labelTrain).length > 0) ? labelTrain : null;
            handleClustering(select, ncluster, modelType, transformType, labelTrainData, (d) => {
                setClusteringState(d);
                if (labels.length > 0) {
                    handleEvaluation(d.data, labels, setEvaluation);
                }
                handleTsne(select, d.data, (v) => setTsne(v));
            });
    };

    const handleModalChart = (timeserie, title, index) => {
        setModalTimeserie({timeserie: timeserie, title: title});
        onOpen();
        if (clustering) {
            handleRanking(select, index, clustering.data, (d) => setRanking(d));
        }
    };

    return (
        <>
            <Box textAlign="center" py={10} px={6}>
                <CheckCircleIcon boxSize={'50px'} color={'green.500'} />
                <Heading as="h2" size="xl" mt={6} mb={2}>
                    File uploaded successfully!
                </Heading>
                <Text color={'gray.500'}>
                    Now you can view your Time Series, select and assign/edit label to features and go on
                </Text>
            </Box>

            <Box textAlign="center" py={labels.length > 0 ? 10 : 0} px={6}>
                <Container maxW='sm'>
                    <label>
                        Transform Type
                    <Select onChange={(e) => setParams({ modelType: modelType, transformType: e.target.value })} value={transformType} name='transform_type' placeholder='Select option'>
                        <option value='std'>std</option>
                        <option value='minmax'>minmax</option>
                        <option value=''>empty</option>
                    </Select>
                    </label>
                    <br />
                    <label>
                        Model Type
                        <Select onChange={(e) => setParams({ modelType: e.target.value, transformType: transformType })} value={modelType} name='model_type' placeholder='Select option'>
                            <option value='Hierarchical'>Hierarchical</option>
                            <option value='KMeans'>KMeans</option>
                            <option value='Spectral'>Spectral</option>
                        </Select>
                    </label>
                    <br />
                    <label>
                        Num clusters
                        <Input variant='outline' onChange={({ target }) => setNcluster(parseInt(target.value))} placeholder='n clusters' value={ncluster} />
                    </label>
                    <br />
                    {serverData?.labels.length > 0 && <><label>
                        Train size
                        <Slider
                            colorScheme='green'
                            onChange={(val) => setSliderValue(val)} 
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => {
                                setShowTooltip(false);
                                if (labels.length > 0) {
                                    handleSplit(labels, trainSizeValue/100, (d) => setLabelTrain(d.data));
                                }
                            }}
                            onBlur={() => (labels.length > 0) ? handleSplit(labels, trainSizeValue/100, (d) => setLabelTrain(d.data)) : null}
                        >
                            <SliderMark value={25} mt='2' ml='-2.5' fontSize='sm'>
                            25%
                            </SliderMark>
                            <SliderMark value={50} mt='2' ml='-2.5' fontSize='sm'>
                            50%
                            </SliderMark>
                            <SliderMark value={75} mt='2' ml='-2.5' fontSize='sm'>
                            75%
                            </SliderMark>
                            <SliderTrack>
                                <SliderFilledTrack />
                            </SliderTrack>
                            <Tooltip
                                hasArrow
                                bg='green.500'
                                color='white'
                                placement='top'
                                isOpen={showTooltip}
                                label={`${trainSizeValue}%`}
                            >
                                <SliderThumb />
                            </Tooltip>
                        </Slider>
                    </label>
                    </>
                    }
                    <br />
                    <div className='clearfix' />
                    <Button mt='6' mb='5' isLoading={!features} loadingText='Processing, loading features...' onClick={() => onClustering()} colorScheme='green' variant='outline'>
                        Select features & Build cluster graph
                    </Button>
                    <div className='clearfix' />
                    <label><i>You can select the features from the bottom</i></label>
                </Container>
            </Box>

            {evaluation !== undefined &&
            <Container maxW='md'>
                <Text>Evaluation</Text>
                {Object.keys(evaluation).map((v) => {
                    return (<label>
                        {v}
                        <Progress title={`${(evaluation[v]*100).toFixed(0)}%`} colorScheme='green' size='md' value={(evaluation[v]*100).toFixed(0)} />
                    </label>)
                })}
            </Container>}

            <Container mt='5' minW='container.lg'>
                <Accordion mb='5' defaultIndex={[0]} allowMultiple>
                    <AccordionItem>
                        <h2>
                            <AccordionButton>
                                <Box as="span" flex='1' textAlign='left'>
                                    Time Series
                                </Box>
                                {tsne && <Button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            document.getElementById("scatter-chart")?.scrollIntoView();
                                        }}
                                        colorScheme='green'
                                        variant='outline'
                                        isLoading={!features} loadingText='Processing'
                                    >
                                        Go to TSNE
                                </Button>}
                                {shortLabel.length != labels.length && dataToVisualize.labels.length != labels.length && <Box as='span' flex='1' textAlign='right'>
                                    <Button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setDataToVisualize({ labels: labels, data: serverData.data });
                                            doExtraction();
                                        }}
                                        colorScheme='green'
                                        variant='outline'
                                        isLoading={!features} loadingText='Processing'
                                    >
                                        Show all
                                    </Button>
                                </Box>}
                                <AccordionIcon />
                            </AccordionButton>
                        </h2>
                        <AccordionPanel className='timeserie-container-panel' pb={4}>
                            <SimpleGrid columns={3} spacing={5}>
                                {dataToVisualize.data.map((timeserie, i) => {
                                    return (
                                        <Box key={i}>
                                            <Card className={(clustering) ? `cluster-${clustering.data[i]}` : null}>
                                                <CardHeader>
                                                    {serverData?.labels.length == 0 && <Checkbox
                                                        style={{float: 'right'}}
                                                        textAlign='right'
                                                        onChange={(e) => onFeatureCheck(e, i)}
                                                        isChecked={featuresSelected[i]}
                                                        size='md'
                                                        colorScheme='green'
                                                    />}
                                                    {clustering && 
                                                    <Input variant='outline' onChange={({ target }) => setLabelCluster((old) => {
                                                        return {
                                                            ...old,
                                                            [i]: target.value
                                                        }
                                                    })} placeholder={`Cluster ${clustering.data[i]}`} />}
                                                    <Text>{dataToVisualize.labels[i] ? dataToVisualize.labels[i] : `Time Series ${i + 1}`}</Text>
                                                </CardHeader>
                                                <CardBody>
                                                    <LineChart legendDisplayed={false} clickHandler={handleModalChart} timeserie={timeserie} title={dataToVisualize.labels[i] ? dataToVisualize.labels[i] : `Time Series ${i + 1}`} index={i} />
                                                </CardBody>
                                            </Card>
                                        </Box>
                                    )
                                })}
                            </SimpleGrid>
                        </AccordionPanel>
                    </AccordionItem>
                    <AccordionItem>
                        <h2>
                            <AccordionButton>
                                <Box as="span" flex='1' textAlign='left'>
                                    Features
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                        </h2>
                        <AccordionPanel className='features-container-panel' pb={4}>
                            {features && features !== undefined && features.length && <TableContainer>
                                <Table size='sm' variant='striped' colorScheme='green'>
                                    <Thead>
                                    <Tr>
                                        <Th className='sticky-column'>
                                            <Button onClick={updateSelectedFeatures} colorScheme='green' variant='outline'>
                                                Update selection
                                            </Button>
                                        </Th>
                                        {Object.keys(features[0]).slice(0, 40).map((k) => {
                                            return (
                                                <Th isNumeric>
                                                    &nbsp;{k}
                                                </Th>
                                            );
                                        })}
                                    </Tr>
                                    </Thead>
                                    <Tbody>
                                    {features.map((v, k) => {
                                        return (
                                            <Tr>
                                                <Td className='sticky-column'>
                                                    {dataToVisualize.labels[k] ? dataToVisualize.labels[k] : `Time Series ${k}`}
                                                </Td>
                                                {Object.values(v).slice(0, 40).map((feat) => <Td isNumeric>{feat.toFixed(2)}</Td>)}
                                            </Tr>
                                        )
                                    })}
                                    </Tbody>
                                    <Tfoot>
                                    <Tr>
                                        <Th></Th>
                                        {Object.keys(features[0]).slice(0, 40).map((k) => {
                                            return (
                                                <Th isNumeric>
                                                    &nbsp;{k}
                                                </Th>
                                            );
                                        })}
                                    </Tr>
                                    </Tfoot>
                                </Table>
                            </TableContainer>}
                        </AccordionPanel>
                    </AccordionItem>
                </Accordion>
                {tsne && (
                    <>
                        <Box mt={3} mb={3} textAlign='center'>
                            <Text>TSNE chart</Text>
                        </Box>
                        <ScattersChart clickHandler={handleModalChart} timeseries={dataToVisualize.data} labels={dataToVisualize.labels} data={tsne} n={ncluster} />
                    </>
                )}
            </Container>
            <Modal isOpen={isOpen} onop size='full' onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                <ModalHeader />
                <ModalCloseButton />
                <ModalBody>
                    <Box textAlign="center">
                        <h1>{modalTimeserie.title?.toUpperCase()}</h1>
                    </Box>
                    <LineChart legendDisplayed={true} timeserie={modalTimeserie.timeserie} />
                    
                    {ranking && 
                    <TableContainer>
                        <Table size='sm' variant='striped' colorScheme='green'>
                            <Thead>
                            <Tr>
                                <Th className='sticky-column'>Time Series</Th>
                                <Th>Distance</Th>
                                <Th>Label</Th>
                                {ranking?.data && 0 in ranking?.data ? Object.keys(ranking.data[0]).slice(20).map((k) => {
                                    if (k != 'DISTANCE' && k != 'IDX') {
                                        return (<Th>{k}</Th>);
                                    }
                                }) : null}
                            </Tr>
                            </Thead>
                            <Tbody>
                            {ranking?.data && ranking.data.map((v, k) => {
                                return (
                                    <Tr>
                                        <Td className='sticky-column'>
                                            {dataToVisualize.labels[v['IDX']] ? dataToVisualize.labels[v['IDX']] : `Time Series ${v['IDX']}`}
                                        </Td>
                                        <Td>
                                            {v['DISTANCE'].toFixed(2)}
                                        </Td>
                                        <Td>
                                            {ranking.preds[k].toFixed(2)}
                                        </Td>
                                        {Object.keys(v).map((k) => {
                                            if (k != 'DISTANCE' && k != 'IDX') {
                                                return (
                                                    <Td>{v[k].toFixed(2)}</Td>
                                                );
                                            }
                                        })}
                                    </Tr>
                                )
                            })}
                            </Tbody>
                        </Table>
                    </TableContainer>}
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme='green' mr={3} onClick={onClose}>
                    Close
                    </Button>
                </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}