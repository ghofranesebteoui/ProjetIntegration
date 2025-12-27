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

export const dashboardService = {
  // Statistiques complètes du dashboard
  async getStats() {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");

    const res = await fetch(`${API_URL}/courses/dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("Erreur chargement stats");
    return res.json();
  },

  // Planning - Récupérer les sessions programmées
  async getSchedule() {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");

    const res = await fetch(`${API_URL}/courses/dashboard/schedule`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("Erreur chargement planning");
    return res.json();
  },

  // Planning - Créer une session
  async createSchedule(scheduleData) {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");

    const res = await fetch(`${API_URL}/courses/dashboard/schedule`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(scheduleData),
    });

    if (!res.ok) throw new Error("Erreur création session");
    return res.json();
  },

  // Planning - Supprimer une session
  async deleteSchedule(id) {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");

    const res = await fetch(`${API_URL}/courses/dashboard/schedule/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Erreur suppression session");
  },

  // Questions - Récupérer les questions des étudiants
  async getQuestions() {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");

    const res = await fetch(`${API_URL}/courses/dashboard/questions`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("Erreur chargement questions");
    return res.json();
  },

  // Questions - Répondre à une question
  async answerQuestion(id, answer) {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");

    const res = await fetch(
      `${API_URL}/courses/dashboard/questions/${id}/answer`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answer }),
      }
    );

    if (!res.ok) throw new Error("Erreur réponse question");
    return res.json();
  },

  // Ressources - Récupérer toutes les ressources
  async getResources() {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");

    const res = await fetch(`${API_URL}/courses/dashboard/resources`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("Erreur chargement ressources");
    return res.json();
  },
};
