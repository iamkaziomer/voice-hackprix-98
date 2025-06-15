import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDropzone } from 'react-dropzone';
import { API_ENDPOINTS } from '../config/api';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Upload, 
  X, 
  MapPin, 
  Camera, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';

const ModernUploadIssuePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    concernAuthority: '',
    colony: '',
    pincode: '',
    priority: 'medium',
    tags: []
  });
  
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const authorities = [
    'Municipal Corporation',
    'Water Department',
    'Electricity Board',
    'Traffic Police',
    'Health Department',
    'Education Department',
    'Waste Management',
    'Public Works Department'
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low Priority', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High Priority', color: 'bg-red-100 text-red-800' }
  ];

  const commonTags = [
    'Road Repair', 'Street Light', 'Garbage', 'Water Supply', 
    'Drainage', 'Traffic', 'Safety', 'Noise Pollution'
  ];

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 3,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (acceptedFiles) => {
      const newImages = acceptedFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substr(2, 9)
      }));
      setImages(prev => [...prev, ...newImages].slice(0, 3));
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const uploadImages = async () => {
    if (images.length === 0) return [];

    const uploadedImages = [];
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('Authentication token not found');
    }

    try {
      for (let i = 0; i < images.length; i++) {
        const formData = new FormData();
        formData.append('images', images[i].file);

        const response = await axios.post(API_ENDPOINTS.IMAGES.UPLOAD, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(((i + progress / 100) / images.length) * 100);
          }
        });

        if (response.data.success) {
          uploadedImages.push(...response.data.images.map(img => img.url));
        }
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      console.error('Error details:', error.response?.data);

      // If image upload fails, we can still proceed without images
      console.warn('Proceeding without images due to upload failure');
      return []; // Return empty array to allow issue creation without images
    }

    return uploadedImages;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to report an issue');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Upload images first (if any)
      let imageUrls = [];
      if (images.length > 0) {
        try {
          imageUrls = await uploadImages();
          console.log('Images uploaded successfully:', imageUrls);
        } catch (imageError) {
          console.warn('Image upload failed, proceeding without images:', imageError);
          toast.error('Image upload failed, but issue will be created without images');
          // Continue without images
        }
      }

      // Create issue
      const issueData = {
        ...formData,
        images: imageUrls,
        location: {
          type: 'Point',
          coordinates: [0, 0] // You can integrate with geolocation API
        }
      };

      console.log('Creating issue with data:', issueData);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to report an issue');
      }

      const response = await axios.post(API_ENDPOINTS.ISSUES.CREATE, issueData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.data.success) {
        toast.success('Issue reported successfully!');
        navigate('/issues');
      } else {
        throw new Error(response.data.message || 'Failed to create issue');
      }
    } catch (error) {
      console.error('Error submitting issue:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit issue';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle size={64} className="text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">Please login to report an issue</p>
          <button 
            onClick={() => navigate('/primary')}
            className="btn-primary"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Report an Issue</h1>
          <p className="text-xl text-gray-600">
            Help improve your community by reporting issues that need attention
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <FileText className="mr-2" size={24} />
              Issue Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Brief description of the issue"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="input-field"
                  placeholder="Provide detailed information about the issue..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Concerned Authority *
                </label>
                <select
                  name="concernAuthority"
                  value={formData.concernAuthority}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="">Select Authority</option>
                  {authorities.map(authority => (
                    <option key={authority} value={authority}>
                      {authority}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <div className="flex space-x-3">
                  {priorityLevels.map(level => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, priority: level.value }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.priority === level.value
                          ? level.color
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <MapPin className="mr-2" size={24} />
              Location Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Colony/Area *
                </label>
                <input
                  type="text"
                  name="colony"
                  value={formData.colony}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Enter your colony or area name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode *
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  required
                  pattern="[0-9]{6}"
                  className="input-field"
                  placeholder="Enter 6-digit pincode"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Tags (Optional)
            </h2>
            <div className="flex flex-wrap gap-2">
              {commonTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    formData.tags.includes(tag)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <Camera className="mr-2" size={24} />
              Upload Images (Optional)
            </h2>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {isDragActive ? 'Drop images here' : 'Upload issue photos'}
              </p>
              <p className="text-gray-600">
                Drag & drop images or click to browse (Max 3 images, 5MB each)
              </p>
            </div>

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {images.map(image => (
                  <div key={image.id} className="relative">
                    <img
                      src={image.preview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading}
              className="btn-primary px-8 py-3 text-lg"
            >
              {uploading ? (
                <div className="flex items-center">
                  <Loader className="animate-spin mr-2" size={20} />
                  Submitting... {Math.round(uploadProgress)}%
                </div>
              ) : (
                <div className="flex items-center">
                  <CheckCircle className="mr-2" size={20} />
                  Submit Issue
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModernUploadIssuePage;
