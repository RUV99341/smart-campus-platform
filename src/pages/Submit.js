import React, { useState } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';

export default function Submit(){
  const { user } = useAuth();
  const [title,setTitle] = useState('');
  const [desc,setDesc] = useState('');
  const [category,setCategory] = useState('General');
  const [file,setFile] = useState(null);

  async function handleSubmit(e){
    e.preventDefault();
    let imageUrl = '';
    if(file){
      const storageRef = ref(storage, `complaint-images/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      imageUrl = await getDownloadURL(storageRef);
    }
    await addDoc(collection(db,'complaints'),{
      title, description: desc, category, image: imageUrl, createdBy: user.uid, createdAt: serverTimestamp(), status: 'open', upvotes: []
    });
    setTitle(''); setDesc(''); setCategory('General'); setFile(null);
    alert('Submitted');
  }

  return (
    <div style={{padding:20}}>
      <h2>Submit Complaint</h2>
      <form onSubmit={handleSubmit} style={{maxWidth:600}}>
        <input required placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} style={{width:'100%',padding:8,marginBottom:8}} />
        <textarea required placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} style={{width:'100%',padding:8,marginBottom:8}} />
        <input placeholder="Category" value={category} onChange={e=>setCategory(e.target.value)} style={{width:'100%',padding:8,marginBottom:8}} />
        <input type="file" onChange={e=>setFile(e.target.files[0])} style={{marginBottom:8}} />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
