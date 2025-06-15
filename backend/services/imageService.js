const CLOUDFLARE_BASE_URL = `https://${import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${import.meta.env.VITE_CLOUDFLARE_BUCKET}`;

const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-image.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  return `${CLOUDFLARE_BASE_URL}/${imagePath}`;
};

const uploadImages = async (files) => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/images/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload images');
    }

    const data = await response.json();
    return data.images;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
};

const deleteImage = async (imageKey) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/images/${imageKey}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete image');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

export { uploadImages, deleteImage, getImageUrl };
