import { useState, useEffect, useRef } from "react";
import { HiPaperAirplane, HiX, HiUser, HiClock } from "react-icons/hi";
import { messagingService } from "../services/messagingService";
import "./InstantMessaging.css";

export default function InstantMessaging({ user }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Charger les conversations
  useEffect(() => {
    loadConversations();
    // Rafraîchir toutes les 10 secondes
    const interval = setInterval(loadConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  // Charger les messages quand une conversation est sélectionnée
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      // Rafraîchir les messages toutes les 3 secondes
      const interval = setInterval(() => loadMessages(selectedConversation.id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  // Désactivé: Pas de scroll automatique
  useEffect(() => {
    // Ne rien faire - scroll désactivé
  }, [messages]);

  const scrollToBottom = () => {
    // Fonction désactivée
  };

  const isUserNearBottom = () => {
    if (!messagesContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const threshold = 150; // pixels from bottom
    return scrollHeight - scrollTop - clientHeight < threshold;
  };

  const handleScroll = () => {
    // Ne rien faire - laisser l'utilisateur contrôler le scroll
    // Le scroll automatique ne se fera que lors de l'envoi d'un nouveau message
  };

  const loadConversations = async () => {
    try {
      const data = await messagingService.getConversations();
      setConversations(data);
    } catch (err) {
      console.error("Erreur chargement conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const data = await messagingService.getMessages(conversationId);
      setMessages(data);
      
      // Marquer comme lu
      await messagingService.markAsRead(conversationId);
      // Mettre à jour le compteur de non-lus
      setConversations(prev =>
        prev.map(c =>
          c.id === conversationId ? { ...c, unread_count: 0 } : c
        )
      );
    } catch (err) {
      console.error("Erreur chargement messages:", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    
    try {
      const message = await messagingService.sendMessage(
        selectedConversation.id,
        selectedConversation.student_id,
        newMessage.trim()
      );
      
      setMessages(prev => [...prev, message]);
      setNewMessage("");
      messageInputRef.current?.focus();
      
      // Mettre à jour la conversation dans la liste
      setConversations(prev =>
        prev.map(c =>
          c.id === selectedConversation.id
            ? { ...c, last_message: newMessage.trim(), last_message_at: new Date() }
            : c
        )
      );
    } catch (err) {
      console.error("Erreur envoi message:", err);
      alert("Erreur lors de l'envoi du message");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  const formatMessageTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="messaging-container">
        <p className="text-center py-8 text-gray-500">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="messaging-container">
      <div className="messaging-layout">
        {/* Liste des conversations */}
        <div className="conversations-list">
          <div className="conversations-header">
            <h3>Messages</h3>
            <span className="conversations-count">{conversations.length}</span>
          </div>
          
          {conversations.length === 0 ? (
            <div className="empty-conversations">
              <HiUser className="empty-icon" />
              <p>Aucune conversation</p>
            </div>
          ) : (
            <div className="conversations-items">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`conversation-item ${
                    selectedConversation?.id === conv.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="conversation-avatar">
                    {conv.first_name?.charAt(0)}{conv.last_name?.charAt(0)}
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-header-row">
                      <span className="conversation-name">
                        {conv.first_name} {conv.last_name}
                      </span>
                      <span className="conversation-time">
                        {formatTime(conv.last_message_at)}
                      </span>
                    </div>
                    <div className="conversation-preview">
                      <span className={conv.unread_count > 0 ? "unread" : ""}>
                        {conv.last_message || "Aucun message"}
                      </span>
                      {conv.unread_count > 0 && (
                        <span className="unread-badge">{conv.unread_count}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Zone de messages */}
        <div className="messages-area">
          {!selectedConversation ? (
            <div className="no-conversation-selected">
              <HiUser className="empty-icon-large" />
              <p>Sélectionnez une conversation</p>
              <span>Choisissez un étudiant pour commencer à discuter</span>
            </div>
          ) : (
            <>
              {/* Header de la conversation */}
              <div className="messages-header">
                <div className="messages-header-info">
                  <div className="messages-avatar">
                    {selectedConversation.first_name?.charAt(0)}
                    {selectedConversation.last_name?.charAt(0)}
                  </div>
                  <div>
                    <h4>
                      {selectedConversation.first_name}{" "}
                      {selectedConversation.last_name}
                    </h4>
                    <span className="messages-email">
                      {selectedConversation.email}
                    </span>
                  </div>
                </div>
                <button
                  className="close-conversation-btn"
                  onClick={() => setSelectedConversation(null)}
                >
                  <HiX />
                </button>
              </div>

              {/* Liste des messages */}
              <div className="messages-list" ref={messagesContainerRef}>
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <p>Aucun message dans cette conversation</p>
                    <span>Envoyez le premier message !</span>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message-item ${
                        msg.sender_id === user?.id ? "sent" : "received"
                      }`}
                    >
                      <div className="message-bubble">
                        <p className="message-text">{msg.message}</p>
                        <span className="message-time">
                          <HiClock className="time-icon" />
                          {formatMessageTime(msg.created_at)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Formulaire d'envoi */}
              <form className="message-input-form" onSubmit={handleSendMessage}>
                <input
                  ref={messageInputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrivez votre message..."
                  className="message-input"
                  disabled={sending}
                />
                <button
                  type="submit"
                  className="send-message-btn"
                  disabled={!newMessage.trim() || sending}
                >
                  <HiPaperAirplane />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
