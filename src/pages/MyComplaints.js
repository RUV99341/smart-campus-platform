import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function MyComplaints(){
  const { user } = useAuth();
  const [items,setItems] = useState([]);

  useEffect(()=>{
    if(!user) return;
    const q = query(collection(db,'complaints'), where('createdBy','==',user.uid), orderBy('createdAt','desc'));
    const unsub = onSnapshot(q, snap=> setItems(snap.docs.map(d=>({id:d.id, ...d.data()}))));
    return unsub;
  },[user]);

  return (
    <div style={{padding:20}}>
      <h2>My Complaints</h2>
      {items.map(i=> (
        <div key={i.id} style={{border:'1px solid #eee',padding:12,marginBottom:8}}>
          <h4><Link to={`/complaint/${i.id}`}>{i.title}</Link></h4>
          <p>{i.description}</p>
          {i.image ? (
            <div style={{ margin: '8px 0' }}>
              <img src={i.image} alt={i.title} style={{ maxWidth: '100%', maxHeight: 300 }} />
            </div>
          ) : (
            <div style={{ width: '100%', height: 120, background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', margin: '8px 0' }}>No image</div>
          )}
        </div>
      ))}
    </div>
  );
}
