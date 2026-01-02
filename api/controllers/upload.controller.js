import cloudinary from '../config/cloudinary.js';
import { errorHandler } from '../utils/error.js';

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(errorHandler(400, 'No file uploaded'));
    }

    const { buffer, mimetype, size } = req.file;

    // Validate File Type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(mimetype)) {
      return next(errorHandler(400, 'Invalid file format. Only jpg, jpeg, png, webp are allowed'));
    }

    // Validate File Size (Max 2MB)
    if (size > 2 * 1024 * 1024) {
      return next(errorHandler(400, 'File size too large. Max limit is 2MB'));
    }

    // Upload to Cloudinary using stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'banglar-heshel',
      },
      (error, result) => {
        if (error) {
          console.error(error);
          return next(errorHandler(500, 'Cloudinary upload failed'));
        }
        res.status(200).json({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    // Since we don't have a streamifier package, we can use standard node stream
    const { Readable } = await import('stream');
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    stream.pipe(uploadStream);

  } catch (error) {
    next(error);
  }
};

export const deleteImage = async (req, res, next) => {
  try {
    const { public_id } = req.body;
    const publicIdParam = req.params.publicId;

    const idToDelete = publicIdParam || public_id;

    if (!idToDelete) {
      return next(errorHandler(400, 'Public ID is required'));
    }

    // Delete image from Cloudinary
    cloudinary.uploader.destroy(idToDelete, (error, result) => {
      if (error) {
        console.error(error);
        return next(errorHandler(500, 'Failed to delete image from Cloudinary'));
      }
      res.status(200).json({ message: 'Image deleted successfully' });
    });

  } catch (error) {
    next(error);
  }
};
