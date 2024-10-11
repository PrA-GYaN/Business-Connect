// ImageUpload.js

import React, { useState } from 'react';
import axios from 'axios';

const ImageUpload = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  // Handle image file selection
  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  // Handle image upload
  const handleUpload = async () => {
    if (!selectedImage) {
      alert('Please select an image first.');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedImage);

    setUploading(true);

    try {
        console.log(formData);
      const response = await axios.post('http://localhost:5000/users/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Extract the URL for the uploaded image
      const { fileUrl } = response.data;
      setImageUrl(fileUrl);

      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2>Upload Image</h2>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload Image'}
      </button>

      {imageUrl && (
        <div>
          <h3>Uploaded Image:</h3>
          <img src={imageUrl} alt="Uploaded" width="300" />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
