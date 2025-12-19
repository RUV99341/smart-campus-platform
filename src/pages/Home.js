import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ComplaintCard from '../components/ComplaintCard';
import TrendingSidebar from '../components/TrendingSidebar';
import ShortcutsPanel from '../components/ShortcutsPanel';
import TipsBox from '../components/TipsBox';

export default function Home(){
  const [complaints,setComplaints] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(()=>{
    const q = query(collection(db,'complaints'), orderBy('createdAt','desc'));
    const unsub = onSnapshot(q, snap=> setComplaints(snap.docs.map(d=>({id:d.id, ...d.data()}))));
    return unsub;
  },[]);

  async function toggleUpvote(c){
    if(!user) return navigate('/');
    const docRef = doc(db,'complaints',c.id);
    const has = c.upvotes && c.upvotes.includes(user.uid);
    if(has) await updateDoc(docRef,{ upvotes: arrayRemove(user.uid) });
    else await updateDoc(docRef,{ upvotes: arrayUnion(user.uid) });
  }

  return (
    <div className="home-root">
      <div className="home-main">
        <h2>Complaint Feed</h2>
        {complaints.map(c=> (
          <ComplaintCard key={c.id} complaint={c} onToggleUpvote={toggleUpvote} currentUser={user} />
        ))}
      </div>

      <aside className="home-side">
        <TrendingSidebar />
        <ShortcutsPanel />
        <TipsBox />
      </aside>
    </div>
  );
}
