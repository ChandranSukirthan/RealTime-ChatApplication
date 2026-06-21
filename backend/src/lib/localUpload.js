import fs from "fs";
import path from "path";

/**
 * Saves a file buffer locally into the /uploads folder.
 * @param {object} file - Express multer file object
 * @returns {string} The relative path of the saved file
 */
export function saveLocalFile(file) {
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `chat-${Date.now()}-${safeName}`;
    const filePath = path.join(uploadsDir, fileName);
    
    fs.writeFileSync(filePath, file.buffer);
    return `/uploads/${fileName}`;
}
