import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

// Services pour les étudiants
export const quizService = {
  // Récupérer tous les quiz disponibles
  getAll: async () => {
    const response = await axios.get(`${API_URL}/student/quizzes`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Récupérer un quiz par ID
  getById: async (id) => {
    const response = await axios.get(`${API_URL}/student/quizzes/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Soumettre un quiz
  submit: async (id, answers) => {
    const response = await axios.post(
      `${API_URL}/student/quizzes/${id}/submit`,
      { answers },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Récupérer les badges de l'étudiant
  getBadges: async () => {
    const response = await axios.get(`${API_URL}/student/badges`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};

// Services pour les enseignants
export const teacherQuizService = {
  // Récupérer tous les quiz de l'enseignant
  getAll: async () => {
    const response = await axios.get(`${API_URL}/assignments`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Récupérer un quiz avec ses soumissions
  getById: async (id) => {
    const response = await axios.get(`${API_URL}/assignments/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Créer un quiz
  create: async (quizData) => {
    const response = await axios.post(`${API_URL}/assignments`, quizData, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Supprimer un quiz
  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/assignments/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  // Voir les détails d'une soumission
  getSubmission: async (submissionId) => {
    const response = await axios.get(
      `${API_URL}/assignments/submissions/${submissionId}/grade`,
      { headers: getAuthHeader() }
    );
    return response.data;
  },
};
