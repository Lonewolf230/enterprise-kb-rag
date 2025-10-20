import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import './FileUploadModal.css';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const allowedFormats = ['pdf', 'txt', 'docx', 'mp3', 'wav'];
  const MAX_FILE_SIZE = 20 * 1024 * 1024; 

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
      if(ext && !allowedFormats.includes(ext)) alert(`File format not allowed: ${file.name}`);
      else if(file.size > MAX_FILE_SIZE) alert(`File size exceeds limit (20MB): ${file.name}`);
      return ext && allowedFormats.includes(ext) && file.size <= MAX_FILE_SIZE;
    });
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      console.log('Uploading files:', selectedFiles);
      setSelectedFiles([]);
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload Files</h2>
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
            <p className="upload-text">Drag and drop files here</p>
            <p className="upload-subtext">or</p>
            <label className="browse-btn">
              Browse Files
              <input
                type="file"
                multiple
                accept=".pdf,.txt,.docx,.mp3,.wav"
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div className="allowed-formats">
            <p className="formats-title">Allowed formats:</p>
            <div className="formats-list">
              {allowedFormats.map(format => (
                <span key={format} className="format-tag">{format.toUpperCase()}</span>
              ))}
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="selected-files">
              <p className="selected-files-title">Selected Files ({selectedFiles.length})</p>
              <div className="files-list">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="file-item">
                    <div className="file-info">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{formatFileSize(file.size)}</span>
                    </div>
                    <button className="remove-file-btn" onClick={() => removeFile(index)}>
                      <X size={16} />
                    </button>
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
            disabled={selectedFiles.length === 0}
          >
            Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;