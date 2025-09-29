import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Crear directorios de uploads si no existen
const eventsUploadDir = path.join(__dirname, '../uploads/events');
const profilesUploadDir = path.join(__dirname, '../uploads/profiles');

if (!fs.existsSync(eventsUploadDir)) {
    fs.mkdirSync(eventsUploadDir, { recursive: true });
}

if (!fs.existsSync(profilesUploadDir)) {
    fs.mkdirSync(profilesUploadDir, { recursive: true });
}

// Configuración de multer para eventos
const eventsStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, eventsUploadDir);
    },
    filename: (req, file, cb) => {
        // Generar nombre único para el archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `event-${uniqueSuffix}${ext}`);
    }
});

// Configuración de multer para perfiles
const profilesStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, profilesUploadDir);
    },
    filename: (req, file, cb) => {
        // Generar nombre único para el archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `profile-${uniqueSuffix}${ext}`);
    }
});

// Filtro para solo permitir imágenes
const fileFilter = (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen'), false);
    }
};

// Configuración de multer para eventos
const upload = multer({
    storage: eventsStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB máximo
        files: 1 // Solo un archivo
    }
});

// Configuración de multer para perfiles
const profileUpload = multer({
    storage: profilesStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB máximo
        files: 1 // Solo un archivo
    }
});

export default upload;
export { profileUpload };