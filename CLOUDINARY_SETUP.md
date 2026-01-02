# Cloudinary Image Upload Setup Guide

This guide details the environment variables and steps required to configure the newly implemented Cloudinary image upload feature in the MERN stack application.

## 1. Environment Variables

### Backend (`api/.env`)
You must add the following variables to your existing `api/.env` file. These credentials allow the backend to authenticate with Cloudinary.

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (`client/.env`)
**No changes required.** The frontend sends images to the backend (`/api/upload/image`), which handles the Cloudinary interaction.

## 2. Getting Cloudinary Credentials

1.  **Sign Up / Log In**:
    *   Go to [cloudinary.com](https://cloudinary.com/) and sign up for a free account if you haven't already.
    *   Log in to your account.

2.  **Dashboard**:
    *   Once logged in, you will be directed to the **Console** or **Dashboard** (usually the default landing page).
    *   Look for the **"Product Environment Credentials"** section at the top left of the dashboard.

3.  **Copy Credentials**:
    *   **Cloud Name**: Copy the value and paste it as `CLOUDINARY_CLOUD_NAME`.
    *   **API Key**: Copy the value and paste it as `CLOUDINARY_API_KEY`.
    *   **API Secret**: Click "Reveal" (eye icon) to show the secret, then copy and paste it as `CLOUDINARY_API_SECRET`.

## 3. Configuration Details

*   **Folder Name**: The controller is configured to upload images to a specific folder in your Cloudinary Media Library named **`banglar-heshel`**. Cloudinary will automatically create this folder upon the first upload if it doesn't exist.
*   **Allowed Formats**: The backend allows `.jpg`, `.jpeg`, `.png`, and `.webp` files.
*   **Size Limit**: The backend strictly limits uploads to **2MB**. Larger files will be rejected with an error.

## 4. Verification

After updating your `api/.env` file, restart your backend server:

```bash
# In the api directory (or root if using concurrently)
npm run dev
```

Try uploading a profile picture or a food category image to verify the integration.
