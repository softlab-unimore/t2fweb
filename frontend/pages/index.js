import {
    Box,
    Heading,
    Container,
    Text,
    Stack,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';

import handleUpload from '../utils/upload';
import Dropzone from '../components/Dropzone';

import { useRecoilState } from 'recoil';
import { baseState } from '../state/index';

export default function CallToActionWithAnnotation() {
    const router = useRouter();
    const [timeseries, setTimeseries] = useRecoilState(baseState);
    const onDrop = (files) => {
        handleUpload(files, onUploadCallback);
    }

    const onUploadCallback = (data) => {
        setTimeseries(data);
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
