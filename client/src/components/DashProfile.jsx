import { TextInput, Alert, Modal } from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import axios from 'axios';
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  updateStart,
  updateSuccess,
  updateFailure,
} from "../redux/user/userSlice";
import { useDispatch } from "react-redux";
import { enqueueSnackbar } from "notistack";

export default function DashProfile() {
  const { currentUser, error, loading } = useSelector((state) => state.user);
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [updateUserError, setUpdateUserError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const filePickerRef = useRef();
  const dispatch = useDispatch();

  // Handle file selection for profile picture upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setImageFileUploadError("File size exceeds 2MB");
        setImageFileUploadProgress(null);
        setImageFile(null);
      } else {
        setImageFile(file);
        setImageFileUrl(URL.createObjectURL(file));
      }
    }
  };

  // Upload image to Cloudinary
  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile]);

  const uploadImage = async () => {
    setImageFileUploading(true);
    setImageFileUploadError(null);
    setImageFileUploadProgress(0);

    const data = new FormData();
    data.append('image', imageFile);

    try {
        const res = await axios.post('/api/upload/image', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                const progress = (progressEvent.loaded / progressEvent.total) * 100;
                setImageFileUploadProgress(progress.toFixed(0));
            },
        });

        setImageFileUrl(res.data.secure_url);
        setFormData({ ...formData, profilePicture: res.data.secure_url, profilePicturePublicId: res.data.public_id });
        setImageFileUploading(false);
    } catch (error) {
        setImageFileUploadError("Could not upload image");
        setImageFileUploadProgress(null);
        setImageFile(null);
        setImageFileUrl(null);
        setImageFileUploading(false);
        console.error(error);
    }
  };

  // Handle form changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateUserError(null);
    if (Object.keys(formData).length === 0) {
      enqueueSnackbar("No changes made", { variant: "info" });
      return;
    }
    if (imageFileUploading) {
      setUpdateUserError("Please wait for image to upload");
      return;
    }

    // Validation checks
    if (formData.username !== undefined) {
        if (formData.username.trim() === "") {
             setUpdateUserError("Username cannot be empty");
             return;
        }
        if (!/^[a-zA-Z0-9_ ]+$/.test(formData.username)) {
            setUpdateUserError("Username must contain only letters, numbers, spaces, and underscores");
            return;
        }
    }

    if (formData.phone !== undefined) {
         if (!/^\d{11}$/.test(formData.phone)) {
             setUpdateUserError("Phone number must be exactly 11 digits");
             return;
         }
    }

    try {
      dispatch(updateStart());
      const res = await fetch(`/api/employee/update/${currentUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(updateFailure(data.message));
        setUpdateUserError(data.message);
      } else {
        dispatch(updateSuccess(data));
        enqueueSnackbar("Profile updated successfully", { variant: "success" });
      }
    } catch (error) {
      dispatch(updateFailure(error.message));
      setUpdateUserError(error.message);
    }
  };

  // Form fields definition
  const fields = [
    { id: "firstname", label: "Firstname", type: "text" },
    { id: "lastname", label: "Lastname", type: "text" },
    { id: "username", label: "Username", type: "text" },
    { id: "email", label: "Email", type: "email" },
    { id: "phone", label: "Phone", type: "text" },
    { id: "address", label: "Address", type: "text" },
    { id: "nic", label: "NIC", type: "text" },
    { id: "password", label: "Password", type: "password" },
  ];

  return (
    <div className="w-full max-w-xl p-6 m-8 mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={filePickerRef}
          hidden
        />
        <div
          className="relative self-center w-32 h-32 overflow-hidden rounded-full shadow-md cursor-pointer"
          onClick={() => filePickerRef.current.click()}
        >
          {imageFileUploadProgress && (
            <CircularProgressbar
              value={imageFileUploadProgress || 0}
              text={`${imageFileUploadProgress}%`}
              strokeWidth={5}
              styles={{
                root: {
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                },
                path: {
                  stroke: `rgba(62, 152, 199, ${
                    imageFileUploadProgress / 100
                  })`,
                },
              }}
            />
          )}
          <img
            src={imageFileUrl || currentUser.profilePicture || "default-avatar-url"}
            alt="user"
            className={`rounded-full w-full h-full object-cover shadow-lg border-8 border-[#1f1f1f] ${
              imageFileUploadProgress &&
              imageFileUploadProgress < 100 &&
              "opacity-60"
            }`}
          />
        </div>
        {imageFileUploadError && (
          <Alert color="failure">{imageFileUploadError}</Alert>
        )}
        {fields.map(({ id, label, type }) => (
          <div key={id}>
            <label htmlFor={id} className="text-[#1f1f1f] text-sm font-semibold">
              {label}
            </label>
            <TextInput
              type={type}
              id={id}
              placeholder={label.toLowerCase()}
              defaultValue={currentUser[id]}
              onChange={handleChange}
            />
          </div>
        ))}
        <button
          type="submit"
          className="rounded-md text-[#d4d4d4] bg-cyan-600 p-2 font-semibold hover:bg-cyan-900"
        >
          {loading ? "Loading..." : "Update"}
        </button>
      </form>

      {updateUserError && (
        <Alert color="failure" className="mt-5">
          {updateUserError}
        </Alert>
      )}
    </div>
  );
}
