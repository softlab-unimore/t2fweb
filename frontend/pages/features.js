import { Box, Heading, Text } from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';

import { useRecoilValue } from 'recoil';
import { baseState } from '../state/index';

export default function features() {
    const baseData = useRecoilValue(baseState);
    console.log(baseData);

    return (
        <Box textAlign="center" py={10} px={6}>
            <CheckCircleIcon boxSize={'50px'} color={'green.500'} />
            <Heading as="h2" size="xl" mt={6} mb={2}>
                File uploaded successfully!
            </Heading>
            <Text color={'gray.500'}>
                Now you can view your timeseries, select and assign/edit label to features and go on
            </Text>
        </Box>
    );
}