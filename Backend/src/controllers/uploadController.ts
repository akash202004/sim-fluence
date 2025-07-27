import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';

// POST /api/upload/image
export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided' });
      return;
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'simfluence',
      resource_type: 'auto',
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto' }
      ]
    });

    // Return the uploaded image details
    res.status(200).json({
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes
    });

  } catch (error: any) {
    console.error('Error uploading image to Cloudinary:', error);
    res.status(500).json({ 
      error: 'Failed to upload image',
      details: error.message 
    });
  }
};

// DELETE /api/upload/image/:publicId
export const deleteImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      res.status(400).json({ error: 'Public ID is required' });
      return;
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.status(200).json({ 
        success: true, 
        message: 'Image deleted successfully' 
      });
    } else {
      res.status(400).json({ 
        error: 'Failed to delete image',
        details: result.result 
      });
    }

  } catch (error: any) {
    console.error('Error deleting image from Cloudinary:', error);
    res.status(500).json({ 
      error: 'Failed to delete image',
      details: error.message 
    });
  }
};

// GET /api/upload/images
export const getImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { max_results = 20, next_cursor } = req.query;

    const options: any = {
      max_results: parseInt(max_results as string),
      folder: 'simfluence'
    };

    if (next_cursor) {
      options.next_cursor = next_cursor;
    }

    // Get images from Cloudinary
    const result = await cloudinary.api.resources(options);

    res.status(200).json({
      success: true,
      images: result.resources,
      next_cursor: result.next_cursor,
      total_count: result.total_count
    });

  } catch (error: any) {
    console.error('Error fetching images from Cloudinary:', error);
    res.status(500).json({ 
      error: 'Failed to fetch images',
      details: error.message 
    });
  }
}; 