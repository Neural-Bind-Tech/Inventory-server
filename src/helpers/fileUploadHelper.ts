import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import * as fs from 'fs';
import config from '../config';
import path from 'path';
import type { ICloudinaryResponse, IUploadFile } from '../interface';

cloudinary.config({
  ...(config.cloudinary.cloud_name ? { cloud_name: config.cloudinary.cloud_name } : {}),
  ...(config.cloudinary.api_key ? { api_key: config.cloudinary.api_key } : {}),
  ...(config.cloudinary.api_secret ? { api_secret: config.cloudinary.api_secret } : {})
});

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, fileExtension);
    cb(null, `${baseName}-${uniqueSuffix}${fileExtension}`);
  },
});

const upload = multer({ storage: storage });

const uploadToCloudinary = async (file: IUploadFile): Promise<ICloudinaryResponse | undefined> => {
    return new Promise((resolve, reject) => {
        // Determine resource type based on file mimetype
        let resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto';

        if (file.mimetype.startsWith('video/')) {
            resourceType = 'video';
        } else if (file.mimetype.startsWith('image/')) {
            resourceType = 'image';
        } else {
            // For documents (PDF, DOC, etc.)
            resourceType = 'raw';
        }

        cloudinary.uploader.upload(file.path,{resource_type: resourceType}, (error, result) => {
                fs.unlinkSync(file.path);
                if (error) {
                    reject(error)
                }
                else {
                    resolve(result as unknown as ICloudinaryResponse)
                }
        })
    })
};

const getStaticFileUrl = (filename: string): string => {
  const BACKEND_URL = config.backend_url;

  if (!BACKEND_URL) {
    throw new Error("Backend url doesn't exists!");
  }

  return `${BACKEND_URL}/${filename}`;
};

const uploadToLocal = async (
  file: IUploadFile
): Promise<{ filename: string; url: string }> => {
  if (!file || !file.filename) {
    throw new Error('File not found or invalid file object');
  }

  const publicUrl = getStaticFileUrl(file.filename);

  return {
    filename: file.filename,
    url: publicUrl,
  };
};

const deleteLocalFile = (filename: string): boolean => {
  try {
    const filePath = path.join('uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

const deleteFromCloudinary = async (fileUrl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            // Extract public_id from Cloudinary URL
            const urlParts = fileUrl.split('/');
            const uploadIndex = urlParts.indexOf('upload');

            if (uploadIndex === -1) {
                reject(new Error('Invalid Cloudinary URL'));
                return;
            }

            const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join('/');

            const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.')) || publicIdWithExtension;

            // Determine resource type from URL
            let resourceType: 'image' | 'video' | 'raw' = 'image';
            if (urlParts.includes('video')) {
                resourceType = 'video';
            } else if (urlParts.includes('raw')) {
                resourceType = 'raw';
            }

            cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, _result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });

        } catch (error) {
            reject(error);
        }
    });
};

export const FileUploadHelper = {
  uploadToCloudinary,
  upload,
  uploadToLocal,
  deleteLocalFile,
  deleteFromCloudinary
};
