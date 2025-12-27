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

export const messagingService = {
  // Récupérer toutes les conversations
  async getConversations() {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");

    const res = await fetch(`${API_URL}/messaging/conversations`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("Erreur chargement conversations");
    return res.json();
  },

  // Récupérer les messages d'une conversation
  async getMessages(conversationId) {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");

    const res = await fetch(
      `${API_URL}/messaging/conversations/${conversationId}/messages`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) throw new Error("Erreur chargement messages");
    return res.json();
  },

  // Envoyer un message
  async sendMessage(conversationId, receiverId, message) {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");

    const res = await fetch(`${API_URL}/messaging/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        receiver_id: receiverId,
        message,
      }),
    });

    if (!res.ok) throw new Error("Erreur envoi message");
    return res.json();
  },

  // Créer une nouvelle conversation
  async createConversation(studentId, courseId = null) {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");

    const res = await fetch(`${API_URL}/messaging/conversations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        student_id: studentId,
        course_id: courseId,
      }),
    });

    if (!res.ok) throw new Error("Erreur création conversation");
    return res.json();
  },

  // Marquer une conversation comme lue
  async markAsRead(conversationId) {
    const token = getToken();
    if (!token) throw new Error("Non authentifié");

    const res = await fetch(
      `${API_URL}/messaging/conversations/${conversationId}/read`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) throw new Error("Erreur marquage lecture");
    return res.json();
  },
};
