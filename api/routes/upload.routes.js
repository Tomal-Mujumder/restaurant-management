import express from 'express';
import { uploadImages } from '../controllers/upload.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.post('/uploadImages', verifyToken, upload.array('images', 5), uploadImages);

export default router;
