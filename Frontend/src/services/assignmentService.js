const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const getToken = () => {
  try {
    let token = localStorage.getItem("token");
    if (!token) {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        token = user.token;
      }
    }
    return token;
  } catch (err) {
    console.error("Erreur récupération token:", err);
    return null;
  }
};

export const assignmentService = {
  async getAll() {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");

    const res = await fetch(`${API_URL}/assignments`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("Erreur chargement");
    return res.json();
  },

  async getById(id) {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");

    const res = await fetch(`${API_URL}/assignments/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("Erreur chargement");
    return res.json();
  },

  async create(assignmentData) {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");

    const res = await fetch(`${API_URL}/assignments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(assignmentData),
    });

    if (!res.ok) throw new Error("Erreur création");
    return res.json();
  },

  async gradeSubmission(submissionId, score, feedback) {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");

    const res = await fetch(
      `${API_URL}/assignments/submissions/${submissionId}/grade`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ score, feedback }),
      }
    );

    if (!res.ok) throw new Error("Erreur notation");
    return res.json();
  },

  async delete(id) {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");

    const res = await fetch(`${API_URL}/assignments/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Erreur suppression");
  },
};
