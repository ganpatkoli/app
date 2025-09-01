import axios from './axiosInstance';

// User login API
export const loginApi = ({ email, password }) => {
  return axios.post('/auth/login', { email, password });
};

// Agent registration API
export const registerAgentApi = (data) => {
  return axios.post('/auth/register-agent', data);
};
