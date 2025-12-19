import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function TrendingSidebar(){
  const [items,setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(()=>{
    const q = query(collection(db,'complaints'), orderBy('upvotesCount','desc'));
    const unsub = onSnapshot(q, snap=>{
      const docs = snap.docs.map(d=>({id:d.id, ...d.data()}));
      // sort by upvotes array length if upvotesCount isn't present
      docs.sort((a,b)=>((b.upvotes||[]).length - (a.upvotes||[]).length));
      setItems(docs.slice(0,5));
    });
    return unsub;
  },[]);

  return (
    <div>
      <h4>Trending Complaints</h4>
      <div className="trending">
        {items.map(it=> (
          <div className="trending-item" key={it.id} onClick={()=>navigate('/feed')}>
            <strong>{it.title}</strong>
            <div className="meta">{it.category} • {it.createdAt ? new Date(it.createdAt.seconds*1000).toLocaleDateString() : ''}</div>
          </div>
        ))}
      </div>
      <div style={{marginTop:8}}>
        <button className="view-all" onClick={()=>navigate('/feed')}>View all-trending ›</button>
      </div>
    </div>
  );
}
