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
    deleteHistory: async (data) => {
        return await apiInstance.post(`${ROUTES.HISTORY}/delete`, data)
    },
    getRanking : async () => {
        return await apiInstance.get(`${ROUTES.RANKING}`)
    },
    getFriends: async (userId) => {
        return await apiInstance.get(`${ROUTES.FRIEND}/${userId}`)
    },
    postFriend: async (userId,id) => {
        return await apiInstance.post(`${ROUTES.FRIEND}/${userId}/${id}`)
    },
    getIndividualFriend : async (userId,id) => {
        return await apiInstance.get(`${ROUTES.FRIEND}/${userId}/${id}`)
    }
}

export default api;