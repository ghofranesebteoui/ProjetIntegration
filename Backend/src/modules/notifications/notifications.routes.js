const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/authmiddleware");
const { pool } = require("../../config/db");

// GET /api/notifications - Récupérer toutes les notifications
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const sql = `
      SELECT 
        id,
        type,
        title,
        message,
        is_read as read,
        created_at,
        CASE
          WHEN TIMESTAMPDIFF(MINUTE, created_at, NOW()) < 60 
            THEN CONCAT('Il y a ', TIMESTAMPDIFF(MINUTE, created_at, NOW()), ' minute', IF(TIMESTAMPDIFF(MINUTE, created_at, NOW()) > 1, 's', ''))
          WHEN TIMESTAMPDIFF(HOUR, created_at, NOW()) < 24 
            THEN CONCAT('Il y a ', TIMESTAMPDIFF(HOUR, created_at, NOW()), ' heure', IF(TIMESTAMPDIFF(HOUR, created_at, NOW()) > 1, 's', ''))
          ELSE CONCAT('Il y a ', TIMESTAMPDIFF(DAY, created_at, NOW()), ' jour', IF(TIMESTAMPDIFF(DAY, created_at, NOW()) > 1, 's', ''))
        END as time
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `;

    const [notifications] = await pool.query(sql, [userId]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    res.json({
      notifications: notifications.map((n) => ({
        ...n,
        read: Boolean(n.read),
      })),
      unreadCount,
    });
  } catch (error) {
    console.error("Erreur récupération notifications:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PUT /api/notifications/:id/read - Marquer une notification comme lue
router.put("/:id/read", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const sql = `
      UPDATE notifications 
      SET is_read = 1 
      WHERE id = ? AND user_id = ?
    `;

    await pool.query(sql, [notificationId, userId]);

    res.json({ success: true });
  } catch (error) {
    console.error("Erreur marquage notification:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PUT /api/notifications/read-all - Marquer toutes les notifications comme lues
router.put("/read-all", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const sql = `
      UPDATE notifications 
      SET is_read = 1 
      WHERE user_id = ? AND is_read = 0
    `;

    await pool.query(sql, [userId]);

    res.json({ success: true });
  } catch (error) {
    console.error("Erreur marquage toutes notifications:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// DELETE /api/notifications/:id - Supprimer une notification
router.delete("/:id", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const sql = `
      DELETE FROM notifications 
      WHERE id = ? AND user_id = ?
    `;

    await pool.query(sql, [notificationId, userId]);

    res.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression notification:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
