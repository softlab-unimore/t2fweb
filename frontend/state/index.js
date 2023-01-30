import { atom } from 'recoil';

const baseState = atom({
    key: 'base_state',
    default: {
        server_data: [],
        data: [],
        labels: [],
        cluster: undefined,
        selection: undefined,
        valutation: undefined,
    }
})

const labelState = atom({
    key: 'label_state',
    default: [],
})

const featuresState = atom({
    key: 'features_state',
    default: {
        features: undefined,
        featureRequestSent: false,
    },
});

const featuresSelectedState = atom({
    key: 'featuresSelectedState',
    default: []
})

export { baseState, labelState, featuresState, featuresSelectedState };