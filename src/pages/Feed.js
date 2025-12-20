import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export default function Feed(){
  const [complaints,setComplaints] = useState([]);
  const { user } = useAuth();

  useEffect(()=>{
    const q = query(collection(db,'complaints'), orderBy('createdAt','desc'));
    const unsub = onSnapshot(q, snap=>{
      setComplaints(snap.docs.map(d=>({id:d.id, ...d.data()})));
    });
    return unsub;
  },[]);

  async function toggleUpvote(c){
    const docRef = doc(db,'complaints',c.id);
    const has = c.upvotes && c.upvotes.includes(user.uid);
    if(has) await updateDoc(docRef,{ upvotes: arrayRemove(user.uid) });
    else await updateDoc(docRef,{ upvotes: arrayUnion(user.uid) });
  }

  return (
    <div style={{padding:20}}>
      <h2>Complaints Feed</h2>
      <div>
        {complaints.map(c=> (
          <div key={c.id} style={{border:'1px solid #ddd',padding:12,marginBottom:8}}>
            <h4>{c.title}</h4>
            <p>{c.description}</p>
            {c.image ? (
              <div style={{ margin: '8px 0' }}>
                <img src={c.image} alt={c.title} style={{ maxWidth: '100%', maxHeight: 300 }} />
              </div>
            ) : (
              <div style={{ width: '100%', height: 140, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', margin: '8px 0' }}>No image</div>
            )}
            <div>
              <button onClick={()=>toggleUpvote(c)}>{c.upvotes && c.upvotes.includes(user.uid) ? 'Unupvote' : 'Upvote'}</button>
              <span style={{marginLeft:8}}>{(c.upvotes && c.upvotes.length) || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
