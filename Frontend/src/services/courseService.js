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

export const courseService = {
  async getAll() {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");

    const res = await fetch(`${API_URL}/courses`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (res.status === 401) throw new Error("Token invalide");
    if (!res.ok) throw new Error("Erreur chargement");
    return res.json();
  },

  // Récupérer les cours de l'enseignant connecté
  async getTeacherCourses() {
    const token = getToken();
    console.log("Token récupéré:", token ? "Oui" : "Non");
    if (!token) throw new Error("Non authentifié");

    const res = await fetch(`${API_URL}/courses`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Réponse API courses:", res.status);

    if (res.status === 401) throw new Error("Token invalide");
    if (res.status === 403)
      throw new Error("Accès refusé - vérifiez votre rôle");
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Erreur chargement des cours");
    }
    return res.json();
  },

  async getById(id) {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");

    const res = await fetch(`${API_URL}/courses/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (res.status === 404) throw new Error("Cours non trouvé");
    if (res.status === 401) throw new Error("Token invalide");
    if (!res.ok) throw new Error("Erreur chargement du cours");
    return res.json();
  },

  async create(courseData) {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");

    const res = await fetch(`${API_URL}/courses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(courseData),
    });

    if (!res.ok) throw new Error("Erreur création");
    return res.json();
  },

  async update(id, courseData) {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");

    const res = await fetch(`${API_URL}/courses/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(courseData),
    });

    if (!res.ok) throw new Error("Erreur mise à jour");
    return res.json();
  },

  async delete(id) {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");

    const res = await fetch(`${API_URL}/courses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Erreur suppression");
  },

  // Upload un fichier vers un cours
  async uploadContent(courseId, file, title = "") {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");

    const formData = new FormData();
    formData.append("file", file);
    if (title) formData.append("title", title);

    const res = await fetch(`${API_URL}/courses/${courseId}/contents`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) throw new Error("Erreur upload");
    return res.json();
  },

  // Ajouter un lien (vidéo YouTube, etc.)
  async addLink(courseId, url, title = "") {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");

    const res = await fetch(`${API_URL}/courses/${courseId}/links`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, title }),
    });

    if (!res.ok) throw new Error("Erreur ajout lien");
    return res.json();
  },

  // Supprimer un contenu
  async deleteContent(courseId, contentId) {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");

    const res = await fetch(
      `${API_URL}/courses/${courseId}/contents/${contentId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) throw new Error("Erreur suppression contenu");
  },
};
