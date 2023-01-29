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
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import handleExtraction from '../utils/extraction';

import { useRecoilState } from 'recoil';
import { baseState } from '../state/index';

import dynamic from "next/dynamic"
const LineChart = dynamic(() => import("../components/LineChart"), {
    // Do not import in server side
    ssr: false,
})

export default function features() {
    const [{ data, serverData, labels, features, featureRequestSent }, setBaseState] = useRecoilState(baseState);
    console.log(data, labels);

    useEffect(() => {
        if (serverData !== undefined && !featureRequestSent) {
            handleExtraction(serverData, 100, 2, (extractionData) => {
                setBaseState((old) => {
                    return {
                        ...old,
                        features: extractionData,
                        featureRequestSent: true
                    }
                });
                console.log(features);
            })
        }
    }, []);

    const setLabel = (e, i) => {
        setBaseState((old) => {
            const newLabels = [...old.labels];
            newLabels[i] = e.target.value;
            return {
                ...old,
                labels
            }
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
                <Accordion defaultIndex={[0]} allowToggle>
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
                                                    <Input value={labels[i]} onChange={(e) => setLabel(e, i)} placeholder={`Timeserie ${i + 1}`} />
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
                </Accordion>
            </Container>
        </>
    );
}