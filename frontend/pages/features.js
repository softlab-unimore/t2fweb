import React, { useEffect } from 'react';
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
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import handleExtraction from '../utils/extraction';

import { useRecoilState } from 'recoil';
import { baseState, labelState, featuresState, featuresSelectedState } from '../state/index';

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
    console.log(data, labels, features);

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
                                                    <Input value={labels[i]} onChange={(e) => onChangeLabel(e, i)} placeholder={`Timeserie ${i + 1}`} />
                                                </CardHeader>
                                                <CardBody>
                                                    <LineChart timeserie={timeserie} />
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
                                        <Th></Th>
                                        {Object.keys(features.data[0]).slice(0, 40).map((k) => {
                                            console.log(featuresSelected[k])
                                            return (
                                                <Th isNumeric>
                                                    <Checkbox onChange={(e) => onFeatureCheck(e, k)} isChecked={featuresSelected[k]} size='sm' colorScheme='green' />
                                                    &nbsp;{k}
                                                </Th>
                                            );
                                        })}
                                    </Tr>
                                    </Thead>
                                    <Tbody>
                                    {features.data.map((v, k) => {
                                        return (
                                            <Tr>
                                                <Td>{labels[k] ? labels[k] : `Timeserie ${k}`}</Td>
                                                {Object.values(v).slice(0, 40).map((feat) => <Td isNumeric>{feat}</Td>)}
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
            </Container>
        </>
    );
}