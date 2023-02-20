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
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import handleExtraction from '../utils/extraction';
import handleSelect from '../utils/select';
import handleClustering from '../utils/clustering';
import handleEvaluation from '../utils/evalutation';
import BarsChart from '../components/BarChart';

import { useRecoilState } from 'recoil';
import { baseState, labelState, featuresState, featuresSelectedState, selectState, clusteringState } from '../state/index';

import dynamic from "next/dynamic"
const LineChart = dynamic(() => import("../components/LineChart"), {
    // Do not import in server side
    ssr: false,
})

export default function features() {
    const [{ data, serverData }, setBaseState] = useRecoilState(baseState);
    const [labels, setLabels] = useRecoilState(labelState);
    const [{ features, featureRequestSent }, setFeatures] = useRecoilState(featuresState);
    const [featuresSelected, setFeaturesSelected] = useRecoilState(featuresSelectedState);
    const [select, setSelectState] = useRecoilState(selectState);
    const [clustering, setClusteringState] = useRecoilState(clusteringState);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [modalTimeserie, setModalTimeserie] = useState([]);

    const [evaluation, setEvaluation] = useState(undefined);
    const [ncluster, setNcluster] = useState(4);
    const [{ modelType, transformType }, setParams] = useState({ modelType: 'Hierarchical', transformType: 'std' });

    useEffect(() => {
        if (serverData !== undefined && !featureRequestSent) {
            handleExtraction(serverData, 100, 2, (extractionData) => {
                setFeatures((old) => {
                    return {
                        ...old,
                        features: extractionData,
                        featureRequestSent: true
                    }
                });

                setFeaturesSelected(() => {
                    return Object.assign({}, ...extractionData.featuresSelected);
                });
            })
        }
    }, []);

    const onChangeLabel = (e, i) => {
        const newLabels = [...labels];
        newLabels[i] = e.target.value;
        setLabels(() => {
            return [
                ...newLabels,
            ]
        })
    }

    const onFeatureCheck = (e, i) => {
        const newFeatures = {...featuresSelected};
        newFeatures[i] = e.target.checked;
        setFeaturesSelected((old) => {
            return newFeatures;
        })
    }

    const updateSelectedFeatures = () => {
        if (Object.keys(featuresSelected).length === 0) return 0;
        const enabledFeatures = Object.keys(featuresSelected).filter((k) => featuresSelected[k]);
        let requestFeatures = features.data;
        if (enabledFeatures.length !== Object.keys(featuresSelected).length) {
            requestFeatures.map((timeserieFeats) => {
                return Object.fromEntries(Object.entries(timeserieFeats).filter((k) => enabledFeatures.includes(k[0])));
            })

        }
        console.log(requestFeatures);
        handleSelect(requestFeatures, (data) => setSelectState(data));
    };

    const onClustering = () => {
        updateSelectedFeatures();
        if (select) {
            handleClustering(select, ncluster, modelType, transformType, (d) => {
                setClusteringState(d);
                handleEvaluation(d.data, labels ? labels : d.data.map((v) => 'x'), setEvaluation);
                onOpen();
            });
        }
    };

    const handleModalChart = (timeserie) => {
        setModalTimeserie(timeserie);
        onOpen();
    };

    return (
        <>
            <Box textAlign="center" py={10} px={6}>
                <CheckCircleIcon boxSize={'50px'} color={'green.500'} />
                <Heading as="h2" size="xl" mt={6} mb={2}>
                    File uploaded successfully!
                </Heading>
                <Text color={'gray.500'}>
                    Now you can view your timeseries, select and assign/edit label to features and go on
                </Text>
            </Box>

            <Box textAlign="center" py={10} px={6}>
                <Container maxW='md'>
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
                    <Button isLoading={!features} loadingText='Processing, loading features...' onClick={() => onClustering()} colorScheme='green' variant='outline'>
                        Build cluster graph
                    </Button>
                </Container>
            </Box>

            {evaluation !== undefined &&
            <Container maxW='md'>
                <Text>Evaluation</Text>
                {Object.keys(evaluation).map((v) => {
                    return (<label>
                        {v}
                        <Progress colorScheme='green' size='md' value={evaluation[v]*100} />
                    </label>)
                })}
            </Container>}

            <Container minW='container.lg'>
                <Accordion defaultIndex={[0]} allowMultiple>
                    <AccordionItem>
                        <h2>
                            <AccordionButton>
                                <Box as="span" flex='1' textAlign='left'>
                                    Timeseries
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                            <SimpleGrid columns={Math.ceil(data.length / 6)} spacing={5}>
                                {data.map((timeserie, i) => {
                                    return (
                                        <Box key={i}>
                                            <Card>
                                                <CardHeader>
                                                    <Input value={labels[i] ? labels[i] : ''} onChange={(e) => onChangeLabel(e, i)} placeholder={`Timeserie ${i + 1}`} />
                                                </CardHeader>
                                                <CardBody>
                                                    <LineChart clickHandler={handleModalChart} timeserie={timeserie} />
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
                        <AccordionPanel pb={4}>
                            {features && features.data !== undefined && features.data.length > 0 && <TableContainer>
                                <Table size='sm' variant='striped' colorScheme='green'>
                                    <Thead>
                                    <Tr>
                                        <Th className='sticky-column'>
                                            <Button onClick={updateSelectedFeatures} colorScheme='green' variant='outline'>
                                                Update selection
                                            </Button>
                                        </Th>
                                        {Object.keys(features.data[0]).slice(0, 40).map((k) => {
                                            return (
                                                <Th isNumeric>
                                                    <Checkbox onChange={(e) => onFeatureCheck(e, k)} isChecked={featuresSelected[k]} size='sm' colorScheme='green' />
                                                    &nbsp;{k.replace(/_|\d+/g, '')}
                                                </Th>
                                            );
                                        })}
                                    </Tr>
                                    </Thead>
                                    <Tbody>
                                    {features.data.map((v, k) => {
                                        return (
                                            <Tr>
                                                <Td className='sticky-column'>
                                                    {labels[k] ? labels[k] : `Timeserie ${k}`}
                                                </Td>
                                                {Object.values(v).slice(0, 40).map((feat) => <Td isNumeric>{feat.toFixed(2)}</Td>)}
                                            </Tr>
                                        )
                                    })}
                                    </Tbody>
                                    <Tfoot>
                                    <Tr>
                                        <Th></Th>
                                        {Object.keys(features.data[0]).slice(0, 40).map((k) => {
                                            return (
                                                <Th isNumeric>
                                                    <Checkbox onChange={(e) => onFeatureCheck(e, k)} isChecked={featuresSelected[k]} size='sm' colorScheme='green' />
                                                    &nbsp;{k.replace(/_|\d+/g, '')}
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
            </Container>
            <Modal isOpen={isOpen} size='full' onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                <ModalHeader />
                <ModalCloseButton />
                <ModalBody>
                    <LineChart timeserie={modalTimeserie} />
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