const cloudinary = require('cloudinary').v2;
const logger = require('./logger');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

/**
 * Upload image to Cloudinary
 * @param {string} base64Image - Base64 encoded image string
 * @param {string} folder - Folder name in Cloudinary
 * @param {string} publicId - Public ID for the image
 * @returns {Promise<Object>} - Upload result with URL
 */
const uploadImage = async (base64Image, folder = 'scribo-notes/avatars', publicId = null) => {
    try {
        const options = {
            folder: folder,
            resource_type: 'image',
            transformation: [
                { width: 400, height: 400, crop: 'fill', gravity: 'face' },
                { quality: 'auto', fetch_format: 'auto' }
            ],
            format: 'jpg' // Convert all to jpg for consistency
        };

        if (publicId) {
            options.public_id = publicId;
            options.overwrite = true;
        }

        const result = await cloudinary.uploader.upload(base64Image, options);

        logger.info(`Image uploaded to Cloudinary: ${result.public_id}`);

        return {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format
        };
    } catch (error) {
        logger.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload image to cloud storage');
    }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 * @returns {Promise<Object>} - Deletion result
 */
const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        logger.info(`Image deleted from Cloudinary: ${publicId}`);
        return result;
    } catch (error) {
        logger.error('Cloudinary delete error:', error);
        throw new Error('Failed to delete image from cloud storage');
    }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} - Public ID or null
 */
const extractPublicId = (url) => {
    if (!url || !url.includes('cloudinary.com')) {
        return null;
    }

    try {
        // Extract public_id from URL
        // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/scribo-notes/avatars/user123.jpg
        // Returns: scribo-notes/avatars/user123
        const parts = url.split('/upload/');
        if (parts.length < 2) return null;

        const pathParts = parts[1].split('/');
        // Remove version (v1234567890) if present
        const relevantParts = pathParts.filter(part => !part.startsWith('v') || isNaN(part.substring(1)));

        // Remove file extension
        const lastPart = relevantParts[relevantParts.length - 1];
        const withoutExtension = lastPart.substring(0, lastPart.lastIndexOf('.')) || lastPart;
        relevantParts[relevantParts.length - 1] = withoutExtension;

        return relevantParts.join('/');
    } catch (error) {
        logger.error('Error extracting public ID from URL:', error);
        return null;
    }
};

module.exports = {
    uploadImage,
    deleteImage,
    extractPublicId,
    cloudinary
};
