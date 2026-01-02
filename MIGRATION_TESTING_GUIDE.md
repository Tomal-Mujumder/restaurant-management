# Cloudinary Migration Testing Checklist & Rollback Plan

This document outlines the test cases and verification steps to ensure the Cloudinary migration is successful, along with a rollback plan in case of critical failures.

## 1. Test Cases

### A. User Profile Picture Upload (MemberDashProfile)
*   [ ] **Standard Upload**: Upload a valid image (JPG/PNG, <2MB) and verify the profile picture updates on the UI.
*   [ ] **Progress Bar**: Verify the circular progress bar shows percentage increment during upload.
*   [ ] **Database Update**: Reload the page to ensure the new image URL persists (check User collection in MongoDB).
*   [ ] **Cleanup**: Upload a second image and verify in Cloudinary Dashboard that the **previous** image (if uploaded via new system) is deleted.
*   [ ] **Invalid Format**: Try uploading a `.txt` or `.pdf` file. Verify error message: "Invalid file format".
*   [ ] **File Size Limit**: Try uploading an image >2MB. Verify error message: "File size too large" (or client-side validation alert).

### B. Employee/Admin Profile Picture Upload (DashProfile)
*   [ ] **Standard Upload**: Log in as Admin/Employee, navigate to Profile, and upload a valid image.
*   [ ] **Persist Check**: Ensure the new image is visible across sessions.
*   [ ] **Cleanup**: Upload a replacement image and confirm the old one is removed from 'banglar-heshel' folder in Cloudinary.

### C. Food Category Image Upload (FoodCategoryForm)
*   [ ] **Creation**: Create a new Food Category with an image.
*   [ ] **Success Toast**: Verify the "Image uploaded successfully!" and "Food item created successfully!" toasts appear.
*   [ ] **URL Verification**: Check the created Food item in the database; `image` field should contain a `res.cloudinary.com` URL.

### D. General & Edge Cases
*   [ ] **Network Failure**: Simulate network drop during upload. Verify the app handles it gracefully (Error Toast/Alert) and doesn't crash.
*   [ ] **No File**: Submit the form without changing the image. Verify no upload request is sent and other data updates correctly.

## 2. Verification Steps

1.  **Cloudinary Dashboard**:
    *   Log in and go to **Media Library**.
    *   Find the **`banglar-heshel`** folder.
    *   Confirm new images appear there.
    *   Confirm deleted images disappear.

2.  **Database Inspection (MongoDB)**:
    *   Check `users` collection: `profilePicture` should look like `https://res.cloudinary.com/...` and `profilePicturePublicId` should be stored.
    *   Check `employees` collection: Similar check for `profilePicture` and `profilePicturePublicId`.
    *   Check `foods` collection: `image` field should be a Cloudinary URL.

3.  **Regression Testing**:
    *   **OAuth**: Test "Continue with Google" login to ensure ensuring `firebase.js` (Auth) still works correctly without the Storage code.
    *   **Navigation**: Browse across pages to ensure no errors related to missing Firebase Storage imports.

## 3. Rollback Plan

If critical issues arise that cannot be fixed immediately, follow these steps to revert to the previous state:

### Step 1: Revert Code Changes
1.  **Frontend**:
    *   Revert `MemberDashProfile.jsx`, `DashProfile.jsx`, and `FoodCategoryForm.jsx` to their state using Firebase Storage.
    *   (You can use Git: `git checkout <commit-hash-before-migration> client/src/components/...`)
2.  **Backend**:
    *   Revert `api/controllers/user.controller.js` and `api/controllers/employee.controller.js` (remove Cloudinary cleanup logic).
    *   Delete or disable `api/routes/upload.routes.js` and remove reference in `api/index.js`.

### Step 2: Restore Dependencies (If removed)
*   If you uninstalled `firebase` (which we didn't, we kept it for Auth), run `npm install firebase`.

### Step 3: Environment Variables
*   Ensure `VITE_FIREBASE_API_KEY` and other Firebase config variables are still present in `client/.env` (we did not remove them).

### Step 4: Verify Rollback
*   Test an image upload to confirm it goes back to Firebase Storage.
