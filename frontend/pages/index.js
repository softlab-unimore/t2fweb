import React, { useState } from 'react';
import {
    Box,
    Heading,
    Container,
    Text,
    Stack,
    Input,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';

import handleUpload from '../utils/upload';
import Dropzone from '../components/Dropzone';

import { useSetRecoilState } from 'recoil';
import { baseState, labelState } from '../state/index';

export default function CallToActionWithAnnotation() {
    const router = useRouter();
    const setTimeseries = useSetRecoilState(baseState);
    const setLabels = useSetRecoilState(labelState);
    const [nClass, setNClass] = useState(null);
    const onDrop = (files) => {
        handleUpload(files, onUploadCallback, nClass);
    }

    const onUploadCallback = (data) => {
        setTimeseries(data);
        setLabels(data.rawLabels);
        router.push('/features');
    };

    return (
        <>
            <Container maxW={'3xl'}>
                <Stack
                    as={Box}
                    textAlign={'center'}
                    spacing={{ base: 8, md: 14 }}
                    py={{ base: 20, md: 36 }}>
                    <Heading
                        fontWeight={600}
                        fontSize={{ base: '2xl', sm: '4xl', md: '6xl' }}
                        lineHeight={'110%'}>
                        Welcome to <br />
                        <Text as={'span'} color={'green.400'}>
                            T2FWEB
                        </Text>
                    </Heading>
                    <Text color={'gray.500'}>
                        This website is a demo of the T2FWeb.<br />
                        Start the demo by uploading your csv file.<br />
                        You can upload the file with/without labels
                    </Text>
                    <Input alignSelf='center' maxW='sm' placeholder='N timeserie per class to view, 0 => all' value={nClass} onChange={(e) => setNClass(e.target.value)} />
                    <Stack
                        direction={'column'}
                        spacing={3}
                        align={'center'}
                        alignSelf={'center'}
                        position={'relative'}>
                        <Dropzone onDropFn={onDrop} />
                    </Stack>
                </Stack>
            </Container>
        </>
    );
}
