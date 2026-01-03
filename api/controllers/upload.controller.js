import { errorHandler } from '../utils/error.js';

export const uploadImages = (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return next(errorHandler(400, 'No files uploaded'));
        }

        // multer-storage-cloudinary puts the URL in file.path
        const urls = req.files.map(file => file.path);

        res.status(200).json({ 
            success: true, 
            message: 'Images uploaded successfully', 
            urls: urls 
        });
    } catch (error) {
        next(error);
    }
};
