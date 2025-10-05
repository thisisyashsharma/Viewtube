import multer from "multer";
// EU8u1.p2.a1.10ln - Thumbnai fixing 

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve to .../src -> go up to project root's public/temp
const uploadDir = path.join(__dirname, "..", "public", "temp");

// make sure folder exists
fs.mkdirSync(uploadDir, { recursive: true });

// Define storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp"); // Specify the destination directory for uploaded files
  },
  filename: function (req, file, cb) {
    // Generate a unique filename for uploaded files
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = file.originalname.split('.').pop(); // Extract file extension
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + extension); // Construct filename
  }
});




// Initialize Multer with the storage configuration
export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // Optional: Limit file size to 10MB
});
