import express from "express";
import { getUsersForSidebar, getConversationsForSidebar, getMessages, sendMessage, editMessage, deleteMessage, addContact, addSampleUser } from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import{ upload} from "../middleware/upload.middleware.js"

const router = express.Router();

router.use(protectRoute)

router.get("/users", getUsersForSidebar);
router.get("/conversations", getConversationsForSidebar);
router.post("/add-contact", addContact);
router.post("/sample-user", addSampleUser);
router.get("/:id", getMessages);
router.post("/send/:id", upload.single("media"), sendMessage);
router.put("/edit/:id", editMessage);
router.delete("/delete/:id", deleteMessage);

export default router;