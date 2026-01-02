import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function ComplaintCard({ complaint, onToggleUpvote, currentUser }){
  const [author, setAuthor] = useState(null);
  const [commentsCount, setCommentsCount] = useState(0);

  useEffect(()=>{
    let unsubComments;
    async function fetchAuthor(){
      try{
        const ref = doc(db, 'users', complaint.createdBy);
        const snap = await getDoc(ref);
        if(snap.exists()) setAuthor(snap.data());
      } catch(e){ console.error(e); }
    }
    fetchAuthor();

    try{
      const commentsRef = collection(db, 'complaints', complaint.id, 'comments');
      unsubComments = onSnapshot(commentsRef, snap=> setCommentsCount(snap.size));
    }catch(e){/* ignore */}

    return ()=> unsubComments && unsubComments();
  },[complaint.id, complaint.createdBy]);

  const hasUpvoted = Array.isArray(complaint.upvotes) && currentUser && complaint.upvotes.includes(currentUser.uid);

  return (
    <article className="card-complaint">
      <div className="card-head">
        <h4>{complaint.title}</h4>
        <span className="tag">{complaint.category || 'General'}</span>
      </div>
      <p className="card-desc">{complaint.description}</p>
      {complaint.image && (
        <div className="thumb"><img src={complaint.image} alt="thumb"/></div>
      )}
      <div className="card-footer">
        <div className="author">
          <img src={author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(author?.name||'U')}`} alt="a" />
          <div className="meta">
            <div className="name">{author?.name || complaint.createdBy}</div>
          </div>
        </div>
        <div className="status">Status: <strong>{complaint.status || 'Pending'}</strong></div>
      </div>

      <div className="card-actions">
        <button onClick={()=>onToggleUpvote(complaint)} className={hasUpvoted? 'upvoted':''}>⬆ Upvote</button>
        <Link to={`/feed`} className="com">💬 {commentsCount}</Link>
        <span className="count">{(complaint.upvotes && complaint.upvotes.length) || 0}</span>
      </div>
    </article>
  );
}
