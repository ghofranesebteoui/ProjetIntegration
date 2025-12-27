const express = require("express");
const router = express.Router();
const messagingController = require("./messaging.controller");
const authenticate = require("../../middlewares/authmiddleware");

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

// Récupérer toutes les conversations de l'enseignant
router.get("/conversations", messagingController.getTeacherConversations);

// Récupérer les messages d'une conversation
router.get(
  "/conversations/:conversationId/messages",
  messagingController.getConversationMessages
);

// Envoyer un message
router.post("/messages", messagingController.sendMessage);

// Créer une nouvelle conversation
router.post("/conversations", messagingController.createConversation);

// Marquer une conversation comme lue
router.put(
  "/conversations/:conversationId/read",
  messagingController.markAsRead
);

module.exports = router;
