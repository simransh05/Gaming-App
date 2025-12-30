import ROUTES from "../constant/Route/route";
import apiInstance from "./apiInstance";

const api = {
    postSignup: async (data) => {
        return await apiInstance.post(`${ROUTES.SIGNUP}`, data)
    },
    postLogin: async (data) => {
        return await apiInstance.post(`${ROUTES.LOGIN}`, data)
    },
    getUser: async () => {
        return await apiInstance.get(`${ROUTES.USER}`)
    },
    postLogout: async () => {
        return await apiInstance.post(`${ROUTES.LOGOUT}`)
    },
    getHistory: async (player1, player2, userId) => {
        return await apiInstance.get(`${ROUTES.HISTORY}/${player1}/${player2}/${userId}`)
    },
    postHistory: async (data) => {
        return await apiInstance.post(`${ROUTES.HISTORY}`, data)
    },
    deleteHistory: async (data) => {
        return await apiInstance.post(`${ROUTES.HISTORY}/delete`, data)
    },
}

export default api;