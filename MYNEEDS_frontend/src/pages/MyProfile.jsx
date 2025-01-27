import React, { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import Title from "../components/Title";

const MyProfile = () => {
  const { token, backendUrl, navigate } = useContext(ShopContext);
  const [userDetails, setUserDetails] = useState({});
  const [image, setImage] = useState(null);
  const [editMode, setEditMode] = useState(false); // State to toggle between view/edit mode
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState(''); // Default to existing phone or empty string

  useEffect(() => {
    if (token) {
      // Fetch user profile details
      const fetchUserProfile = async () => {
        try {
          const response = await axios.get(`${backendUrl}/api/user/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          console.log('response', response);
          
          if (response.data.success) {
            setUserDetails(response.data.user);
            setName(response.data.user.name);
            setEmail(response.data.user.email);
            setPhone(response.data.user.phone);

            // Append timestamp for cache-busting
          if (response.data.user.profileImage) {
            setUserDetails((prevDetails) => ({
              ...prevDetails,
              profileImage: `${response.data.user.profileImage}?v=${new Date().getTime()}`,
            }));
          }
          } else {
            toast.error("Failed to fetch user details.");
          }
        } catch {
          toast.error("Error fetching user details.");
        }
      };

      fetchUserProfile();
    } else {
      navigate('/login'); // Redirect to login if there's no token
    }
  }, [token, backendUrl, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    // Update profile details (name, email, and password)
    const updatedDetails = { name, email, password: password || undefined,phone };

    // Log the details you're sending to the server
    console.log('Updated profile details:', updatedDetails);

    // If there's a new image, update the profile image as well
    if (image) {
      const formData = new FormData();
      formData.append('profileImage', image);

      try {
        const imageResponse = await axios.post(
          `${backendUrl}/api/user/updateProfileImage`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (imageResponse.data.success) {
          toast.success("Profile image updated!");

          // Ensure the updated profile image is appended with a timestamp to avoid caching issues
          const updatedImageUrl = `${imageResponse.data.updatedProfileImage}?v=${new Date().getTime()}`;
          setUserDetails((prevDetails) => ({
            ...prevDetails,
            profileImage: updatedImageUrl,
          }));
        } else {
          toast.error("Failed to update profile image.");
        }
      } catch (error) {
        console.error("Error updating profile image:", error);  // Log any errors in the image update
        toast.error("Error updating profile image.");
      }
    }

    try {
      console.log("Sending request to update profile...");

      const response = await axios.put(
        `${backendUrl}/api/user/updateProfile`,
        updatedDetails,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('response', response);
      

      if (response.data.success) {
        toast.success("Profile updated successfully!");
        setUserDetails(response.data.user); // Update the user details in the state
        setEditMode(false); // Exit edit mode
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error in PUT request:", error);
      toast.error("Error updating profile.");
    }

  };

  return (
    <div className="container px-4 py-8">
      <div className="text-xl sm:text-2xl my-3">
        <Title text1={"MY"} text2={"PROFILE"} />
      </div>

      <div className="flex flex-col items-center">
        <div className="mb-8 flex flex-col items-center">
        {userDetails && userDetails.profileImage ? (
          <img
            // src={`${backendUrl}${userDetails.profileImage}`}
            src={userDetails.profileImage}
            alt="Profile"
            className="w-36 h-36 rounded-full object-cover"
          />
        ) : (
          <div className="w-36 h-36 bg-gray-300 rounded-full flex items-center justify-center text-white">
            No Image
          </div>
        )}

          {editMode && (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-4"
              />
            </>
          )}

          <button
            onClick={() => setEditMode(!editMode)}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
          >
            {editMode ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        <form onSubmit={handleProfileUpdate} className="w-full max-w-md">
          {editMode && (
            <>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-800 mb-4"
                placeholder="Name"
                required
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-800 mb-4"
                placeholder="Email"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-800 mb-4"
                placeholder="Password (Leave blank to keep the same)"
              />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-800 mb-4"
                placeholder="Phone Number (Optional)"
              />

            </>
          )}

          {!editMode && userDetails && (
            <div className="text-center">
              <h3 className="text-lg font-semibold">Name: {userDetails.name}</h3>
              <p className="text-sm text-gray-600">Email: {userDetails.email}</p>
              <p className="text-sm text-gray-600">Phone: {userDetails.phone}</p>
            </div>
          )}

          {editMode && (
            <button
              type="submit"
              className="mt-4 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition"
            >
              Save Changes
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default MyProfile;



