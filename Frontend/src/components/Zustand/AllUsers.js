import { create } from 'zustand'
import api from '../../utils/api'
export const userStore = create((set) => ({
    allUsers: [],
    // loading: true,

    fetchAllUsers: async (userId) => {
        const res = await api.getAllUsers(userId);
        set({ allUsers: res.data.length != 0 ? res.data : [] })
    }
}))