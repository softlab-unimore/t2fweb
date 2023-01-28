import {
    Box,
    chakra,
    Container,
    Stack,
    Text,
    useColorModeValue,
    VisuallyHidden,
} from '@chakra-ui/react';

const SocialButton = () => {
    return (
        <chakra.button
            bg={useColorModeValue('blackAlpha.100', 'whiteAlpha.100')}
            rounded={'full'}
            w={8}
            h={8}
            cursor={'pointer'}
            as={'a'}
            href={href}
            display={'inline-flex'}
            alignItems={'center'}
            justifyContent={'center'}
            transition={'background 0.3s ease'}
            _hover={{
                bg: useColorModeValue('blackAlpha.200', 'whiteAlpha.200'),
            }}>
            <VisuallyHidden>{label}</VisuallyHidden>
            {children}
        </chakra.button>
    );
};

export default function Footer() {
    return (
        <Box
            bg={useColorModeValue('green.50', 'green.900')}
            color={useColorModeValue('green.700', 'green.200')}>
            <Container
                as={Stack}
                py={4}
                direction={{ base: 'column', md: 'row' }}
                justify={{ base: 'center' }}
                align={{ base: 'center', md: 'center' }}>
                <Text>© {(new Date()).getFullYear()} Made with love in Paris</Text>
            </Container>
        </Box>
    );
}