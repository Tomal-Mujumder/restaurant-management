
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { CircularProgressbar } from 'react-circular-progressbar';
import { useDispatch, useSelector } from 'react-redux';
import { deleteUserFailure, deleteUserStart, deleteUserSuccess, signoutSuccess, updateFailure, updateStart, updateSuccess } from '../redux/user/userSlice';
import 'react-circular-progressbar/dist/styles.css';
import { HiEye, HiEyeOff, HiOutlineExclamationCircle } from 'react-icons/hi';
import { Alert, Button, Modal, Spinner, TextInput } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';

export default function DashProfile() {
  const { currentUser, error, loading } = useSelector((state) => state.user);
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [updateUserError, setUpdateUserError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Merged Logic
  const [formData, setFormData] = useState({});
  const filePickerRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setImageFileUploadError('File size too large. Max limit is 2MB');
        setImageFileUploadProgress(null);
        setImageFile(null);
        return;
      }
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  };

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
      setImageFileUploadError('Could not upload image');
      setImageFileUploadProgress(null);
      setImageFile(null);
      setImageFileUrl(null);
      setImageFileUploading(false);
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateUserError(null);
    setUpdateUserSuccess(null);
    if (Object.keys(formData).length === 0) {
      setUpdateUserError('No changes made');
      return;
    }
    if (imageFileUploading) {
      setUpdateUserError('Please wait for image to upload');
      return;
    }

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

    if (formData.contactNumber !== undefined) {
      if (!/^\d{11}$/.test(formData.contactNumber)) {
        setUpdateUserError("Contact number must be exactly 11 digits");
        return;
      }
    }

    try {
      dispatch(updateStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(updateFailure(data.message));
        setUpdateUserError(data.message);
      } else {
        dispatch(updateSuccess(data));
        setUpdateUserSuccess("User's profile updated successfully");
      }
    } catch (error) {
      dispatch(updateFailure(error.message));
      setUpdateUserError(error.message);
    }
  };

  const handleDeleteUser = async () => {
    setShowModal(false);
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(deleteUserFailure(data.message));
      } else {
        dispatch(deleteUserSuccess(data));
        navigate('/');
      }
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignout = async () => {
    try {
      const res = await fetch('/api/user/signout', {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signoutSuccess());
        navigate(`/`);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  if (!currentUser) {
    return (
      <div className='flex items-center justify-center min-h-screen w-full'>
        <Spinner size='xl' />
      </div>
    );
  }

  const formattedDate = currentUser.dateOfBirth ? currentUser.dateOfBirth.split('T')[0] : '';

  return (
    <div className='w-full max-w-lg p-3 mx-auto'>
      <h1 className='text-3xl font-semibold text-center text-black my-7'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          type='file'
          accept='image/*'
          onChange={handleImageChange}
          ref={filePickerRef}
          hidden
        />
        <div
          className='relative self-center w-32 h-32 overflow-hidden rounded-full shadow-md cursor-pointer'
          onClick={() => filePickerRef.current.click()}
        >
          {imageFileUploadProgress && (
            <CircularProgressbar
              value={imageFileUploadProgress || 0}
              text={`${imageFileUploadProgress}%`}
              strokeWidth={5}
              styles={{
                root: {
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                },
                path: {
                  stroke: `rgba(62, 152, 199, ${imageFileUploadProgress / 100})`,
                },
              }}
            />
          )}
          <img
            src={imageFileUrl || currentUser.profilePicture}
            alt='user'
            className={`rounded-full w-full h-full object-cover border-8 border-[lightgray] ${imageFileUploadProgress && imageFileUploadProgress < 100 && 'opacity-60'
              }`}
          />
        </div>
        {imageFileUploadError && (
          <Alert color='failure'>{imageFileUploadError}</Alert>
        )}
        <TextInput
          type='text'
          id='username'
          placeholder='Username'
          defaultValue={currentUser.username || ''}
          onChange={handleChange}
          className='text-black'
        />
        <TextInput
          type='email'
          id='email'
          placeholder='Email'
          defaultValue={currentUser.email || ''}
          onChange={handleChange}
          className='text-black'
        />
        <div className='relative'>
          <TextInput
            type={showPassword ? 'text' : 'password'}
            id='password'
            placeholder='Password'
            onChange={handleChange}
            className='text-black'
          />
          <button
            type='button'
            className='absolute right-2 top-2 text-gray-500'
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
          </button>
        </div>
        <h4 className='text-black'> Personal Information </h4>
        <TextInput
          type='text'
          id='name'
          placeholder='Your Name'
          defaultValue={currentUser.name || ''}
          onChange={handleChange}
          className='text-black'
        />
        <select
          id='gender'
          onChange={handleChange}
          className='w-full p-2 text-black border border-gray-300 rounded-md bg-color-gray-800 dark:text-gray-400'
          defaultValue={currentUser.gender || ''}
        >
          <option value=''>Select Gender</option>
          <option value='male'>Male</option>
          <option value='female'>Female</option>
          <option value='other'>Other</option>
        </select>
        <input
          type='date'
          id='dateOfBirth'
          onChange={handleChange}
          defaultValue={formattedDate}
          className='w-full p-2 mt-1 text-black border border-gray-300 rounded-md dark:text-gray-400'
        />
        <TextInput
          type='text'
          placeholder='Your Address'
          id='address'
          defaultValue={currentUser.address || ''}
          onChange={handleChange}
          className='text-black'
        />
        <TextInput
          type='text'
          placeholder='Your Contact Number'
          id='contactNumber'
          defaultValue={currentUser.contactNumber || ''}
          onChange={handleChange}
          className='text-black'
        />
        <button
          type='submit'
          className='text-white bg-purple-700 hover:bg-purple-600 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-800'
          disabled={loading || imageFileUploading}
          style={{ backgroundColor: '#7E33E0' }}
        >
          {loading || imageFileUploading ? 'Please wait...' : 'Update'}
        </button>
        {updateUserError && (
          <Alert color='failure'>{updateUserError}</Alert>
        )}
        {updateUserSuccess && (
          <Alert color='success' className='mb-5 text-green-800 bg-green-100 font-medium'>
            {updateUserSuccess}
          </Alert>
        )}
      </form>
      <div className='flex items-center justify-between mt-6'>
        <button
          onClick={() => setShowModal(true)}
          className='mt-3 text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900'
        >
          Delete Account
        </button>

        <Modal
          show={showModal}
          size='md'
          popup={true}
          onClose={() => setShowModal(false)}
          className='fixed inset-0 z-50 flex items-center justify-center'
        >
          <Modal.Body className='relative p-6 bg-white rounded-lg shadow-lg'>
            <div className='p-6 text-center border rounded-lg shadow bg-gray-50'>
              <HiOutlineExclamationCircle className='mx-auto mb-4 text-black h-14 w-14 dark:text-gray-200' />
              <h3 className='mb-5 text-lg font-semibold text-black'>
                Are you sure you want to delete your account?
              </h3>
              <div className='flex justify-center gap-4'>
                <Button
                  color='failure'
                  className='text-white bg-black hover:bg-red-700'
                  onClick={handleDeleteUser}
                >
                  Yes, I'm sure
                </Button>
                <Button
                  color='gray'
                  className='text-white bg-black hover:bg-red-700'
                  onClick={() => setShowModal(false)}
                >
                  No, cancel
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>

        <button
          onClick={handleSignout}
          className='mt-3 text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900'
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}