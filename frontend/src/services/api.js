import axios from 'axios';

// Dynamic API URL: Use environment variable, relative /api when hosted or desktop-bundled, or local port 8000 when Vite dev server is on 5173
const API_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && (window.location.port === '5173' || window.location.hostname === 'localhost')
    ? 'http://127.0.0.1:8000/api'
    : '/api'
);

const api = axios.create({
  baseURL: API_URL,
});

// Attach JWT access token automatically if present in storage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('studyos_token') || localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication APIs
export const registerUser = async (email, password) => {
  const response = await api.post('/auth/register', { email, password });
  if (response.data?.access_token) {
    localStorage.setItem('studyos_token', response.data.access_token);
  }
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data?.access_token) {
    localStorage.setItem('studyos_token', response.data.access_token);
  }
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// User Profile APIs
export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};

// Universal Study Space APIs
export const getStudySpaces = async () => {
  const response = await api.get('/study-spaces');
  return response.data;
};

export const createStudySpace = async (spaceData) => {
  const response = await api.post('/study-spaces', spaceData);
  return response.data;
};

export const generateStudySpaceFromText = async (text, title, category) => {
  const response = await api.post('/study-spaces/generate-from-text', { text, title, category });
  return response.data;
};

export const generateStudySpaceFromMaterial = async (materialId, title) => {
  const response = await api.post('/study-spaces/generate-from-material', { material_id: materialId, title });
  return response.data;
};

// Mind Map APIs (React Flow synchronization)
export const getMindMap = async (studySpaceId) => {
  const params = studySpaceId ? { study_space_id: studySpaceId } : {};
  const response = await api.get('/mindmap', { params });
  return response.data;
};

export const updateNodePosition = async (topicId, positionX, positionY) => {
  const response = await api.put(`/mindmap/nodes/${topicId}/position`, {
    position_x: positionX,
    position_y: positionY
  });
  return response.data;
};

export const createDependencyEdge = async (sourceTopicId, targetTopicId, dependencyType = 'PREREQUISITE') => {
  const response = await api.post('/mindmap/dependencies', {
    source_topic_id: sourceTopicId,
    target_topic_id: targetTopicId,
    dependency_type: dependencyType
  });
  return response.data;
};

// Topic APIs
export const getTopics = async (studySpaceId) => {
  const params = studySpaceId ? { study_space_id: studySpaceId } : {};
  const response = await api.get('/topics', { params });
  return response.data;
};

export const getTopic = async (topicId) => {
  const response = await api.get(`/topics/${topicId}`);
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

export const updateTopicStatus = async (topicId, status, progress) => {
  const payload = { status, ...(progress !== undefined ? { progress } : {}) };
  const response = await api.patch(`/topics/${topicId}/status`, payload);
  return response.data;
};

export const toggleCompetency = async (topicId, competencyId) => {
  const response = await api.patch(`/topics/${topicId}/competencies/${competencyId}/toggle`);
  return response.data;
};

// Material & Document Pipeline APIs
export const uploadMaterial = async (formData) => {
  const response = await api.post('/materials/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const getMaterials = async (studySpaceId) => {
  const params = studySpaceId ? { study_space_id: studySpaceId } : {};
  const response = await api.get('/materials', { params });
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

// Command Center & Analytics APIs
export const getWhatToStudyNow = async () => {
  const response = await api.get('/command-center/what-to-study');
  return response.data;
};

export const getWeeklyRetro = async () => {
  const response = await api.get('/command-center/weekly-retro');
  return response.data;
};

export const getWeaknessReport = async () => {
  const response = await api.get('/command-center/weaknesses');
  return response.data;
};

// Debug Lab ('I'm Stuck') APIs
export const getDebugJournals = async (projectId = null, topicId = null) => {
  const params = {};
  if (projectId) params.project_id = projectId;
  if (topicId) params.topic_id = topicId;
  const response = await api.get('/debug-journals', { params });
  return response.data;
};

export const createDebugJournal = async (payload) => {
  const response = await api.post('/debug-journals', payload);
  return response.data;
};

export const getDebugHypothesis = async (payload) => {
  const response = await api.post('/debug-journals/ai-hypothesis', payload);
  return response.data;
};

// Projects APIs
export const getProjects = async (studySpaceId = null) => {
  const params = {};
  if (studySpaceId) params.study_space_id = studySpaceId;
  const response = await api.get('/projects', { params });
  return response.data;
};

export const createProject = async (payload) => {
  const response = await api.post('/projects', payload);
  return response.data;
};

export const updateProject = async (projectId, payload) => {
  const response = await api.put(`/projects/${projectId}`, payload);
  return response.data;
};

// Knowledge Graph Engine API
export const getTopicKnowledgeGraph = async (topicId) => {
  const response = await api.get(`/knowledge-graph/topics/${topicId}`);
  return response.data;
};

// Deep Analytics APIs
export const getAnalyticsDashboard = async () => {
  const response = await api.get('/analytics/dashboard');
  return response.data;
};

export const getActivityHeatmap = async (days = 365) => {
  const response = await api.get('/analytics/heatmap', { params: { days } });
  return response.data;
};

export const getAntiFakeProgressAudit = async () => {
  const response = await api.get('/analytics/anti-fake-progress');
  return response.data;
};

// Batch Offline Sync API
export const batchSyncMutations = async (mutations) => {
  const response = await api.post('/sync/batch', { mutations });
  return response.data;
};

export default api;
