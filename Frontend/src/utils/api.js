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
    postLogout :async () => {
        return await apiInstance.post(`${ROUTES.LOGOUT}`)
    },
    getHistory : async (player1 , player2) => {
        return await apiInstance.get(`history?player1=${player1}&player2=${player2}`)
    },
}

export default api;