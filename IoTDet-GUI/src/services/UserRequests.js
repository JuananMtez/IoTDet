import axios from "axios"
import {properties} from '../properties'

const endpoint = `${properties.protocol}://${properties.url_server}:${properties.port}/user`


const getBearer = () => {
    return {headers: {Authorization: `Bearer ${JSON.parse(localStorage.getItem('token'))}`}}
}


const userRegister = (name, user, password, role) =>
    axios.post(`${endpoint}/`, {
        name: name,
        user: user,
        password: password,
        role: role

    }, getBearer())

const userLogin = (user, password) => {
    const bodyFormData = new FormData()

    bodyFormData.append('grant_type', '')
    bodyFormData.append('username', user)

    bodyFormData.append('password', password)
    bodyFormData.append('scope', '')
    bodyFormData.append('client_id', '')
    bodyFormData.append('client_secret', '')

    return axios.post(`${properties.protocol}://${properties.url_server}:${properties.port}/token`, bodyFormData, {headers: {'Content-Type': "multipart/form-data"}})
}

const getUserProfile = () => axios.get(`${endpoint}/current`, getBearer())

const changePassword = (password) => axios.patch(`${endpoint}/password/change`, {password: password}, getBearer())

const getAllUsers = () => axios.get(`${endpoint}/`, getBearer())
const removeUser = (userId) => axios.delete(`${endpoint}/${userId}`, getBearer())

const changeRole = (userId, role) => axios.patch(`${endpoint}/${userId}/role/change`, {role: role}, getBearer())


export {userRegister, userLogin, getUserProfile, changePassword, getAllUsers, removeUser, changeRole}