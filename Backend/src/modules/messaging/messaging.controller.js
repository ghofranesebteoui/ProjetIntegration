const { pool } = require("../../config/db");

// Récupérer toutes les conversations de l'enseignant
exports.getTeacherConversations = async (req, res) => {
  try {
    const [conversations] = await pool.query(
      `SELECT 
        c.*,
        u.first_name,
        u.last_name,
        u.email,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND receiver_id = ? AND is_read = FALSE) as unread_count,
        (SELECT message FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
       FROM conversations c
       JOIN users u ON c.student_id = u.id
       WHERE c.teacher_id = ?
       ORDER BY c.last_message_at DESC`,
      [req.user.id, req.user.id]
    );
    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer les messages d'une conversation
exports.getConversationMessages = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;

    // Vérifier que la conversation appartient à l'enseignant
    const [conversations] = await pool.query(
      `SELECT * FROM conversations WHERE id = ? AND teacher_id = ?`,
      [conversationId, req.user.id]
    );

    if (conversations.length === 0) {
      return res.status(404).json({ message: "Conversation non trouvée" });
    }

    // Récupérer les messages
    const [messages] = await pool.query(
      `SELECT 
        m.*,
        sender.first_name as sender_first_name,
        sender.last_name as sender_last_name,
        receiver.first_name as receiver_first_name,
        receiver.last_name as receiver_last_name
       FROM messages m
       JOIN users sender ON m.sender_id = sender.id
       JOIN users receiver ON m.receiver_id = receiver.id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at ASC`,
      [conversationId]
    );

    // Marquer les messages comme lus
    await pool.query(
      `UPDATE messages SET is_read = TRUE 
       WHERE conversation_id = ? AND receiver_id = ? AND is_read = FALSE`,
      [conversationId, req.user.id]
    );

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Envoyer un message
exports.sendMessage = async (req, res) => {
  try {
    const { conversation_id, receiver_id, message } = req.body;

    if (!message || !message.trim()) {
      return res
        .status(400)
        .json({ message: "Le message ne peut pas être vide" });
    }

    if (!conversation_id || !receiver_id) {
      return res.status(400).json({ message: "Données manquantes" });
    }

    // Vérifier que la conversation existe et appartient à l'enseignant
    const [conversations] = await pool.query(
      `SELECT * FROM conversations WHERE id = ? AND teacher_id = ?`,
      [conversation_id, req.user.id]
    );

    if (conversations.length === 0) {
      return res.status(404).json({ message: "Conversation non trouvée" });
    }

    // Insérer le message
    const [result] = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, receiver_id, message)
       VALUES (?, ?, ?, ?)`,
      [conversation_id, req.user.id, receiver_id, message]
    );

    // Mettre à jour la date du dernier message dans la conversation
    await pool.query(
      `UPDATE conversations SET last_message_at = NOW() WHERE id = ?`,
      [conversation_id]
    );

    // Récupérer le message créé
    const [newMessage] = await pool.query(
      `SELECT 
        m.*,
        sender.first_name as sender_first_name,
        sender.last_name as sender_last_name,
        receiver.first_name as receiver_first_name,
        receiver.last_name as receiver_last_name
       FROM messages m
       JOIN users sender ON m.sender_id = sender.id
       JOIN users receiver ON m.receiver_id = receiver.id
       WHERE m.id = ?`,
      [result.insertId]
    );

    res.status(201).json(newMessage[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de l'envoi du message" });
  }
};

// Créer une nouvelle conversation (si elle n'existe pas)
exports.createConversation = async (req, res) => {
  try {
    const { student_id, course_id } = req.body;

    if (!student_id) {
      return res.status(400).json({ message: "ID étudiant requis" });
    }

    // Vérifier si la conversation existe déjà
    const [existing] = await pool.query(
      `SELECT * FROM conversations WHERE teacher_id = ? AND student_id = ?`,
      [req.user.id, student_id]
    );

    if (existing.length > 0) {
      return res.json(existing[0]);
    }

    // Créer la conversation
    const [result] = await pool.query(
      `INSERT INTO conversations (teacher_id, student_id, course_id)
       VALUES (?, ?, ?)`,
      [req.user.id, student_id, course_id || null]
    );

    const [newConversation] = await pool.query(
      `SELECT 
        c.*,
        u.first_name,
        u.last_name,
        u.email
       FROM conversations c
       JOIN users u ON c.student_id = u.id
       WHERE c.id = ?`,
      [result.insertId]
    );

    res.status(201).json(newConversation[0]);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Erreur lors de la création de la conversation" });
  }
};

// Marquer une conversation comme lue
exports.markAsRead = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;

    await pool.query(
      `UPDATE messages SET is_read = TRUE 
       WHERE conversation_id = ? AND receiver_id = ? AND is_read = FALSE`,
      [conversationId, req.user.id]
    );

    res.json({ message: "Messages marqués comme lus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
