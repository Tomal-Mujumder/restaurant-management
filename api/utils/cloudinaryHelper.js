import { cloudinary } from '../config/cloudinary.js';

export const deleteImageFromCloudinary = async (imageUrl) => {
    if (!imageUrl) return;

    try {
        // Extract public_id from URL
        // Example URL: https://res.cloudinary.com/demo/image/upload/v1614028394/banglar-heshel/food-items/sample.jpg
        const parts = imageUrl.split('/');
        const versionIndex = parts.findIndex(part => part.startsWith('v') && !isNaN(part.substring(1)));
        
        let publicIdParts = [];
        if (versionIndex !== -1) {
             publicIdParts = parts.slice(versionIndex + 1);
        } else {
             // Fallback if no versioning
             const uploadIndex = parts.findIndex(part => part === 'upload');
             if (uploadIndex !== -1) {
                 publicIdParts = parts.slice(uploadIndex + 1);
             }
        }
        
        if (publicIdParts.length === 0) return;

        const publicIdWithExtension = publicIdParts.join('/');
        const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));

        // Alternatively, if we know the folder structure is consistent, we can just grab from after 'upload/' 
        // But the split method above is safer for varying URL structures. 
        // Given the requirement: "banglar-heshel/food-items/${publicId}"
        // The Cloudinary URL usually contains the folder path in the public ID section.

        // Let's refine based on typical Cloudinary URLs:
        // url: .../upload/v1234/folder/subfolder/id.jpg -> public_id: folder/subfolder/id
        
        const splitUrl = imageUrl.split('/');
        const lastPart = splitUrl.pop();
        const publicIdRaw = lastPart.split('.')[0];
        const folderPath = 'banglar-heshel/food-items'; // As per user requirement
        
        // However, extracting the exact public ID from a full URL can be tricky if folders are involved.
        // A robust way to extract public_id given we know the folder:
        // The URL ends with .../banglar-heshel/food-items/timestamp-filename.ext
        
        const pathIndex = imageUrl.indexOf(folderPath);
        if (pathIndex === -1) {
           // Not in our target folder, ignore
           return;
        }

        const relativePath = imageUrl.substring(pathIndex); // banglar-heshel/food-items/filename.ext
        const fullPublicId = relativePath.substring(0, relativePath.lastIndexOf('.')); // banglar-heshel/food-items/filename

        await cloudinary.uploader.destroy(fullPublicId);
        console.log(`Deleted image from Cloudinary: ${fullPublicId}`);

    } catch (error) {
        console.error(`Error deleting image from Cloudinary (${imageUrl}):`, error);
    }
};
