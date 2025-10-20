import React, { useState } from 'react';
import { X, Upload, Sparkles } from 'lucide-react';
import './ImageUploadModal.css';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ImageWithCaption {
  file: File;
  caption: string;
  previewUrl: string;
}

const ImageUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose }) => {
  const [images, setImages] = useState<ImageWithCaption[]>([]);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const allowedFormats = ['jpg', 'jpeg', 'png'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext && !allowedFormats.includes(ext)) {
        alert(`Only image files (JPG, PNG) are allowed: ${file.name}`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        alert(`File size exceeds limit (10MB): ${file.name}`);
        return false;
      }
      return true;
    });

    const newImages = validFiles.map(file => ({
      file,
      caption: '',
      previewUrl: URL.createObjectURL(file)
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      // Clean up preview URL
      URL.revokeObjectURL(prev[index].previewUrl);
      return updated;
    });
  };

  const updateCaption = (index: number, caption: string) => {
    setImages(prev => prev.map((img, i) => 
      i === index ? { ...img, caption } : img
    ));
  };

  const generateCaption = (index: number) => {
    const placeholderCaptions = [
      'A beautiful landscape with mountains and trees',
      'An architectural view of a modern building',
      'A close-up shot with vibrant colors',
      'An outdoor scene captured during golden hour'
    ];
    const randomCaption = placeholderCaptions[Math.floor(Math.random() * placeholderCaptions.length)];
    updateCaption(index, randomCaption);
  };

  const handleUpload = () => {
    if (images.length > 0) {
      console.log('Uploading images with captions:', images);
      // Clean up preview URLs
      images.forEach(img => URL.revokeObjectURL(img.previewUrl));
      setImages([]);
      onClose();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content image-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload Images</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div
            className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload size={48} strokeWidth={1.5} />
            <p className="upload-text">Drag and drop images here</p>
            <p className="upload-subtext">or</p>
            <label className="browse-btn">
              Browse Images
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png"
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div className="allowed-formats">
            <p className="formats-title">Allowed formats: JPG, PNG</p>
            <p className="size-limit-text">Maximum file size: 10 MB per image</p>
          </div>

          {images.length > 0 && (
            <div className="selected-images">
              <p className="selected-images-title">Selected Images ({images.length})</p>
              <p className="caption-disclaimer">
                💡 Better captions help the LLM generate better answers
              </p>
              <div className="images-list">
                {images.map((image, index) => (
                  <div key={index} className="image-item">
                    <img 
                      src={image.previewUrl} 
                      alt={`Preview ${index + 1}`}
                      className="image-preview"
                    />
                    <div className="image-details">
                      <div className="image-info">
                        <span className="image-name">{image.file.name}</span>
                        <span className="image-size">{formatFileSize(image.file.size)}</span>
                      </div>
                      <div className="caption-section">
                        <div className="caption-input-group">
                          <input
                            type="text"
                            placeholder="Add caption"
                            value={image.caption}
                            onChange={(e) => updateCaption(index, e.target.value)}
                            className="caption-input"
                          />
                          <button 
                            className="generate-caption-btn"
                            onClick={() => generateCaption(index)}
                            title="Generate caption with AI"
                          >
                            <Sparkles size={16} />
                            Generate
                          </button>
                        </div>
                      </div>
                      <button className="remove-image-btn" onClick={() => removeImage(index)}>
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="modal-upload-btn"
            onClick={handleUpload}
            disabled={images.length === 0}
          >
            Upload {images.length > 0 && `(${images.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;