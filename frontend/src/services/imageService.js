// Hardcode the API URL
const API_URL = 'http://localhost:5000';
const PUBLIC_URL = 'https://pub-916e3914cac6ee5760a5465d07d29a87.r2.dev';

const uploadImages = async (files) => {
  try {
    // Validate files
    if (!files || files.length === 0) {
      throw new Error('No files to upload');
    }

    // Validate file sizes and types
    const maxSize = 5 * 1024 * 1024; // 5MB
    for (const file of files) {
      if (file.size > maxSize) {
        throw new Error(`File ${file.name} is too large. Maximum size is 5MB`);
      }
      if (!file.type.startsWith('image/')) {
        throw new Error(`File ${file.name} is not an image`);
      }
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    console.log('Uploading images...', files.length);

    const response = await fetch(`${API_URL}/api/images/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    console.log('Upload response status:', response.status);
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      console.error('Upload error response:', data);
      throw new Error(data.message || 'Failed to upload images');
    }

    console.log('Upload successful:', data);
    return data.images;
  } catch (error) {
    console.error('Error in uploadImages:', error);
    throw error;
  }
};

const deleteImage = async (imageKey) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/api/images/${imageKey}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to delete image');
    }

    return data;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-image.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  return `${PUBLIC_URL}/${imagePath}`;
};

export { uploadImages, deleteImage, getImageUrl };