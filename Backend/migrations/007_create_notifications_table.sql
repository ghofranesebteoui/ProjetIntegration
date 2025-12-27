-- Migration: Créer la table notifications
-- Date: 2025-01-XX

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('success', 'info', 'warning', 'error') DEFAULT 'info',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_read (user_id, is_read),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insérer quelques notifications de démonstration pour l'utilisateur avec id=1
INSERT INTO notifications (user_id, type, title, message, is_read, created_at) VALUES
(1, 'success', 'Quiz complété', 'L\'étudiant Ahmed Ben Ali a terminé le quiz \'Introduction à React\'', FALSE, DATE_SUB(NOW(), INTERVAL 5 MINUTE)),
(1, 'info', 'Nouveau message', 'Vous avez reçu un nouveau message de Sarah Trabelsi', FALSE, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(1, 'warning', 'Session planifiée', 'Rappel: Cours de JavaScript prévu demain à 10h00', FALSE, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(1, 'info', 'Nouveau cours ajouté', 'Le cours \'Node.js Avancé\' a été publié avec succès', TRUE, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 'success', 'Évaluation terminée', 'Toutes les évaluations du quiz \'CSS Flexbox\' sont complétées', TRUE, DATE_SUB(NOW(), INTERVAL 2 DAY));
