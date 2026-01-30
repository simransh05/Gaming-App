import { create } from 'zustand'
import api from '../../utils/api'
export const notificationStore = create((set) => ({
    notification: [],
    // loading: true,

    fetchNotification: async (userId) => {
        const res = await api.getNotification(userId);
        console.log(res.data)
        set({ notification: res.data || [] })
    }
}))