import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

export const getRoadmap = async () => {
  const response = await api.get('/roadmap');
  return response.data;
};

// Topic APIs
export const getTopics = async () => {
  const response = await api.get('/topics');
  return response.data;
};

export const createTopic = async (topicData) => {
  const response = await api.post('/topics', topicData);
  return response.data;
};

export const updateTopic = async (topicId, topicData) => {
  const response = await api.put(`/topics/${topicId}`, topicData);
  return response.data;
};

// Session APIs
export const getSessions = async () => {
  const response = await api.get('/sessions');
  return response.data;
};

export const createSession = async (sessionData) => {
  const response = await api.post('/sessions', sessionData);
  return response.data;
};

export default api;
