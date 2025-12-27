import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiBell,
  HiX,
  HiCheckCircle,
  HiExclamationCircle,
  HiInformationCircle,
  HiClock,
} from "react-icons/hi";
import "./NotificationDropdown.css";

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Charger immédiatement les données de démonstration
    const demoData = getDemoNotifications();
    console.log("Chargement des notifications de démonstration:", demoData);
    setNotifications(demoData);
    setUnreadCount(3);
    
    // Fermer le dropdown si on clique à l'extérieur
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // Pas de token, utiliser les données de démonstration
        setNotifications(getDemoNotifications());
        setUnreadCount(3);
        return;
      }

      const res = await fetch("http://localhost:5000/api/notifications", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } else {
        // API échoue, utiliser les données de démonstration
        console.log("API notifications non disponible, utilisation des données de démonstration");
        setNotifications(getDemoNotifications());
        setUnreadCount(3);
      }
    } catch (err) {
      console.error("Erreur chargement notifications:", err);
      // Utiliser des notifications de démonstration si l'API n'existe pas encore
      setNotifications(getDemoNotifications());
      setUnreadCount(3);
    }
  };

  const getDemoNotifications = () => {
    return [
      {
        id: 1,
        type: "success",
        title: "Quiz complété",
        message: "L'étudiant Ahmed Ben Ali a terminé le quiz 'Introduction à React'",
        time: "Il y a 5 minutes",
        read: false
      },
      {
        id: 2,
        type: "info",
        title: "Nouveau message",
        message: "Vous avez reçu un nouveau message de Sarah Trabelsi",
        time: "Il y a 1 heure",
        read: false
      },
      {
        id: 3,
        type: "warning",
        title: "Session planifiée",
        message: "Rappel: Cours de JavaScript prévu demain à 10h00",
        time: "Il y a 2 heures",
        read: false
      },
      {
        id: 4,
        type: "info",
        title: "Nouveau cours ajouté",
        message: "Le cours 'Node.js Avancé' a été publié avec succès",
        time: "Il y a 1 jour",
        read: true
      },
      {
        id: 5,
        type: "success",
        title: "Évaluation terminée",
        message: "Toutes les évaluations du quiz 'CSS Flexbox' sont complétées",
        time: "Il y a 2 jours",
        read: true
      }
    ];
  };

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <HiCheckCircle className="notif-icon success" />;
      case "warning":
        return <HiExclamationCircle className="notif-icon warning" />;
      case "info":
      default:
        return <HiInformationCircle className="notif-icon info" />;
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Erreur marquage notification:", err);
      // Marquer localement même si l'API échoue
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/notifications/read-all", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Erreur marquage toutes notifications:", err);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/notifications/${notificationId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error("Erreur suppression notification:", err);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }
  };

  return (
    <div className="notification-dropdown-container" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        className="header-icon-btn header-notification-btn"
        onClick={() => {
          console.log("Bouton notification cliqué, isOpen:", !isOpen);
          setIsOpen(!isOpen);
        }}
        style={{ position: 'relative' }}
      >
        <HiBell />
        {unreadCount > 0 && (
          <span className="header-notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown" style={{
          position: 'absolute',
          top: 'calc(100% + 10px)',
          right: 0,
          width: '400px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
          zIndex: 1000
        }}>
          <div className="notification-dropdown-header" style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f9fafb'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1f2937' }}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                className="mark-all-read-btn"
                onClick={markAllAsRead}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#7c3aed',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px'
                }}
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          <div className="notification-list" style={{
            maxHeight: '450px',
            overflowY: 'auto'
          }}>
            {notifications.length === 0 ? (
              <div className="no-notifications" style={{
                padding: '3rem 2rem',
                textAlign: 'center',
                color: '#9ca3af'
              }}>
                <HiBell className="empty-icon" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: '0.95rem' }}>Aucune notification pour le moment</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item ${!notif.read ? "unread" : ""}`}
                  onClick={() => !notif.read && markAsRead(notif.id)}
                  style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    background: !notif.read ? '#f3e8ff' : 'white',
                    position: 'relative'
                  }}
                >
                  {!notif.read && (
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '4px',
                      background: '#7c3aed'
                    }} />
                  )}
                  <div className="notification-content" style={{ display: 'flex', gap: '0.75rem', flex: 1 }}>
                    {getIcon(notif.type)}
                    <div className="notification-text" style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 600, color: '#1f2937' }}>
                        {notif.title}
                      </h4>
                      <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.4 }}>
                        {notif.message}
                      </p>
                      <span className="notification-time" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        color: '#9ca3af'
                      }}>
                        <HiClock /> {notif.time}
                      </span>
                    </div>
                  </div>
                  <button
                    className="delete-notification-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif.id);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#9ca3af',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      borderRadius: '6px'
                    }}
                  >
                    <HiX />
                  </button>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-dropdown-footer" style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid #e5e7eb',
              background: '#f9fafb'
            }}>
              <button className="view-all-btn" style={{
                width: '100%',
                padding: '0.75rem',
                background: 'transparent',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                color: '#6b7280',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
              onClick={() => {
                setIsOpen(false);
                navigate('/enseignant/notifications');
              }}
              >
                Voir toutes les notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
