import { atom } from 'recoil';

const baseState = atom({
    key: 'base_state',
    default: {
        server_data: [],
        data: []
    }
})

export { baseState };