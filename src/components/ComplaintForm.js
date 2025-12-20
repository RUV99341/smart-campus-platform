import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import imageCompression from 'browser-image-compression';

const categories = ['Infrastructure', 'Academics', 'Facility', 'Other'];

export default function ComplaintForm({ redirectTo = '/feed' }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [imageBase64, setImageBase64] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [externalImageUrl, setExternalImageUrl] = useState('');

  async function handleImageChange(e) {
    setError('');
    setProgress(0);
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setImageBase64('');
      setImageFileName('');
      return;
    }

    // compress image using browser-image-compression
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      onProgress: (p) => setProgress(Math.round(p)),
    };

    try {
      const compressedFile = await imageCompression(file, options);
      // final size check
      if (compressedFile.size > 1 * 1024 * 1024) {
        setError('Compressed image is still larger than 1MB. Please choose a smaller image.');
        setImageBase64('');
        setImageFileName('');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImageBase64(reader.result.toString());
        setImageFileName(file.name || 'image');
      };
      reader.onerror = () => {
        setError('Failed to read compressed image file');
      };
      reader.readAsDataURL(compressedFile);
    } catch (err) {
      console.error(err);
      setError('Failed to compress image. Please try a different file.');
      setImageBase64('');
      setImageFileName('');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!user || !user.uid) return setError('You must be signed in to submit a complaint.');
    if (!title.trim() || !description.trim() || !category) return setError('Please fill all required fields.');

    // If external URL provided, validate and prefer it only when no file is attached
    let imageToStore = null;
    if (imageBase64) {
      imageToStore = imageBase64;
    } else if (externalImageUrl && externalImageUrl.trim()) {
      const url = externalImageUrl.trim();
      // basic URL validation and extension check
      try {
        // will throw if invalid
        new URL(url);
        const okExt = /\.(jpg|jpeg|png|gif)$/i.test(url.split('?')[0]);
        if (!okExt) return setError('External image URL must point to a .jpg/.jpeg/.png/.gif file.');
        imageToStore = url;
      } catch (err) {
        return setError('Please enter a valid image URL.');
      }
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        image: imageToStore || null,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        status: 'open',
        upvotes: [],
      };

      await addDoc(collection(db, 'complaints'), payload);

      setTitle('');
      setDescription('');
      setCategory(categories[0]);
      setImageBase64('');

      alert('Complaint submitted successfully.');
      if (redirectTo) navigate(redirectTo);
    } catch (err) {
      console.error(err);
      setError('Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 12 }}>Submit Complaint</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 680 }}>
        {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}

        <label style={{ display: 'block', marginBottom: 6 }}>Title *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Short, descriptive title"
          style={{ width: '100%', padding: 8, marginBottom: 12 }}
        />

        <label style={{ display: 'block', marginBottom: 6 }}>Description *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue in detail"
          rows={6}
          style={{ width: '100%', padding: 8, marginBottom: 12 }}
        />

        <label style={{ display: 'block', marginBottom: 6 }}>Category *</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: 8, marginBottom: 12 }}>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <label style={{ display: 'block', marginBottom: 6 }}>Image (optional) — upload a file</label>
        <input type="file" accept="image/*" onChange={handleImageChange} style={{ marginBottom: 8 }} />
        {progress > 0 && progress < 100 && (
          <div style={{ marginBottom: 8 }}>Compressing image: {progress}%</div>
        )}
        {imageBase64 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>{imageFileName}</div>
            <img src={imageBase64} alt="preview" style={{ maxWidth: 300, maxHeight: 200, display: 'block' }} />
          </div>
        )}

        <div style={{ marginTop: 6, marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Or provide an external Image URL (optional)</label>
          <input
            value={externalImageUrl}
            onChange={(e) => setExternalImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            style={{ width: '100%', padding: 8 }}
          />
          <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>Only used when no file is uploaded. Must end with .jpg/.jpeg/.png/.gif</div>
        </div>

        <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
          {loading ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </form>
    </div>
  );
}
