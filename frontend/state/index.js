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

const selectState = atom({
    key: 'selectState',
    default: undefined
})

const clusteringState = atom({
    key: 'clusteringState',
    default: undefined
})

export { baseState, labelState, featuresState, featuresSelectedState, selectState, clusteringState };