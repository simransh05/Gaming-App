import { create } from 'zustand'
import api from '../../utils/api'
export const friendStore = create((set) => ({
    friends: [],
    // loading: true,

    fetchFriends: async (userId) => {
        const res = await api.getFriends(userId);
        set({ friends: res.data.myFriends || [] })
    }
}))