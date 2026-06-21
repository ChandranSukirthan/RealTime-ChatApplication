import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { hasImageKitConfig, uploadChatMedia } from "../lib/imagekit.js";
import { io, getReceiverSocketId } from "../lib/socket.js";
import { saveLocalFile } from "../lib/localUpload.js";

export async function getUsersForSidebar(req, res) {
    try {
        const loggedInUserId = req.user._id;
        const currentUser = await User.findById(loggedInUserId).populate("contacts", "-clerkId");
        const filterdUsers = currentUser.contacts || [];
        res.status(200).json(filterdUsers);
    } catch (error) {
        console.error("Error in getUsersForSidebar:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getConversationsForSidebar(req, res) {
    try {
        const loggedInUserId = req.user._id;

        const conversations = await Message.aggregate([
            // 1. keep only the messages I sent or received.
            { $match: { $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }] } },
            // 2. Collapse them into one row per chat partner, noting our latest time.
            {
                $group: {
                    _id: { $cond: [{ $eq: ["$senderId", loggedInUserId] }, "$receiverId", "$senderId"] },
                    lastMessageAt: { $max: "$createdAt" },
                },
            },
            // 3. Put the most recent conversation at the top.
            { $sort: { lastMessageAt: -1 } },
            // 4. Look up each partner's user profile (comes back as an array).
            { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
            // 5. Pull that profile out of the array and make it the document.
            { $replaceRoot: { newRoot: { $first: "$user" } } },
            // 6. Hide the private clerkId field from the results.
            { $project: { clerkId: 0 } },
        ]);

        res.status(200).json(conversations);
    } catch (error) {
        console.error("Error in getConversationsForSidebar:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getMessages(req, res) {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ],
        })
            .populate("replyTo", "text image video audio document senderId isDeleted")
            .sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessages:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function sendMessage(req, res) {
    try {
        const { text, replyTo } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        let videoUrl;
        let audioUrl;
        let documentUrl;

        if (req.file) {
            let url;
            if (hasImageKitConfig()) {
                try {
                    url = await uploadChatMedia(req.file);
                } catch (err) {
                    console.error("ImageKit upload failed, falling back to local storage:", err.message);
                    const localPath = saveLocalFile(req.file);
                    const baseUrl = `${req.protocol}://${req.get("host")}`;
                    url = `${baseUrl}${localPath}`;
                }
            } else {
                const localPath = saveLocalFile(req.file);
                const baseUrl = `${req.protocol}://${req.get("host")}`;
                url = `${baseUrl}${localPath}`;
            }
            
            const mime = req.file.mimetype;
            if (mime.startsWith("image/")) imageUrl = url;
            else if (mime.startsWith("video/")) videoUrl = url;
            else if (mime.startsWith("audio/")) audioUrl = url;
            else documentUrl = url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
            video: videoUrl,
            audio: audioUrl,
            document: documentUrl,
            replyTo: replyTo || null,
        });
        await newMessage.save();
        await newMessage.populate("replyTo", "text image video audio document senderId isDeleted");

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error in sendMessage:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function editMessage(req, res) {
    try {
        const { id: messageId } = req.params;
        const { text } = req.body;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }
        if (String(message.senderId) !== String(userId)) {
            return res.status(403).json({ message: "You can only edit your own messages" });
        }
        if (message.isDeleted) {
            return res.status(400).json({ message: "Cannot edit a deleted message" });
        }

        const newText = text ? text.trim() : "";
        if (!newText && !message.image && !message.video && !message.audio && !message.document) {
            return res.status(400).json({ message: "Message text cannot be empty" });
        }

        message.text = newText;
        message.isEdited = true;
        await message.save();
        await message.populate("replyTo", "text image video audio document senderId isDeleted");

        // Emit to receiver
        const receiverSocketId = getReceiverSocketId(String(message.receiverId));
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageEdited", message);
        }
        // Also emit back to sender (other tabs/devices)
        const senderSocketId = getReceiverSocketId(String(message.senderId));
        if (senderSocketId) {
            io.to(senderSocketId).emit("messageEdited", message);
        }

        res.status(200).json(message);
    } catch (error) {
        console.error("Error in editMessage:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function deleteMessage(req, res) {
    try {
        const { id: messageId } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }
        if (String(message.senderId) !== String(userId)) {
            return res.status(403).json({ message: "You can only delete your own messages" });
        }

        // Soft delete: keep record for reply references, just hide content
        message.isDeleted = true;
        message.text = "";
        message.image = undefined;
        message.video = undefined;
        await message.save();

        // Emit to receiver
        const receiverSocketId = getReceiverSocketId(String(message.receiverId));
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageDeleted", { _id: messageId });
        }
        // Also emit back to sender
        const senderSocketId = getReceiverSocketId(String(message.senderId));
        if (senderSocketId) {
            io.to(senderSocketId).emit("messageDeleted", { _id: messageId });
        }

        res.status(200).json({ message: "Message deleted" });
    } catch (error) {
        console.error("Error in deleteMessage:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function addContact(req, res) {
    try {
        const loggedInUserId = req.user._id;
        const { emailOrPhone } = req.body;

        if (!emailOrPhone) {
            return res.status(400).json({ message: "Email or phone number is required" });
        }

        const cleanPhone = emailOrPhone.replace(/[^\d+]/g, "");
        const queryConditions = [
            { email: emailOrPhone.toLowerCase() },
            { phoneNumber: emailOrPhone }
        ];
        
        if (cleanPhone && cleanPhone.length > 2) {
            queryConditions.push({ phoneNumber: cleanPhone });
        }

        const userToAdd = await User.findOne({
            $or: queryConditions,
        });

        if (!userToAdd) {
            return res.status(404).json({ message: "User not found" });
        }
        if (userToAdd._id.toString() === loggedInUserId.toString()) {
            return res.status(400).json({ message: "You cannot add yourself" });
        }

        const currentUser = await User.findById(loggedInUserId);
        if (currentUser.contacts.includes(userToAdd._id)) {
            return res.status(400).json({ message: "User is already in your contacts" });
        }

        currentUser.contacts.push(userToAdd._id);
        await currentUser.save();

        res.status(200).json(userToAdd);
    } catch (error) {
        console.error("Error in addContact:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function searchContact(req, res) {
    try {
        const loggedInUserId = req.user._id;
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({ message: "Email or phone number is required" });
        }

        const cleanPhone = phoneNumber.replace(/[^\d+]/g, "");
        const queryConditions = [
            { email: phoneNumber.toLowerCase() },
            { phoneNumber: phoneNumber }
        ];
        
        if (cleanPhone && cleanPhone.length > 2) {
            queryConditions.push({ phoneNumber: cleanPhone });
        }

        const userFound = await User.findOne({
            $or: queryConditions,
        }).select("-clerkId");

        if (!userFound) {
            return res.status(404).json({ message: "No user found with this email or phone number" });
        }
        if (userFound._id.toString() === loggedInUserId.toString()) {
            return res.status(400).json({ message: "You cannot add yourself" });
        }

        const currentUser = await User.findById(loggedInUserId);
        const isAlreadyContact = currentUser.contacts.includes(userFound._id);

        res.status(200).json({ user: userFound, isAlreadyContact });
    } catch (error) {
        console.error("Error in searchContact:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function addSampleUser(req, res) {
    try {
        const loggedInUserId = req.user._id;

        let sampleUser = await User.findOne({ email: "sample.user@example.com" });

        if (!sampleUser) {
            sampleUser = new User({
                clerkId: "sample_clerk_id_" + Date.now(),
                email: "sample.user@example.com",
                phoneNumber: "+1234567890",
                fullName: "Sample User",
                profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sample",
            });
            await sampleUser.save();
        } else if (!sampleUser.phoneNumber) {
            sampleUser.phoneNumber = "+1234567890";
            await sampleUser.save();
        }

        const currentUser = await User.findById(loggedInUserId);
        if (!currentUser.contacts.includes(sampleUser._id)) {
            currentUser.contacts.push(sampleUser._id);
            await currentUser.save();
        }

        res.status(200).json(sampleUser);
    } catch (error) {
        console.error("Error in addSampleUser:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}
