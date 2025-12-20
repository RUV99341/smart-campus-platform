import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export default function ComplaintDetail(){
  const { id } = useParams();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminNoteText, setAdminNoteText] = useState('');
  const [notes, setNotes] = useState([]);

  useEffect(()=>{
    if(!id) return;
    const ref = doc(db,'complaints',id);
    let unsubDoc = () => {};
    (async ()=>{
      const snap = await getDoc(ref);
      if (snap.exists()) setComplaint({ id: snap.id, ...snap.data() });
      setLoading(false);
    })();

    const q = query(collection(db,'complaints',id,'comments'), orderBy('createdAt','asc'));
    const unsubComments = onSnapshot(q, s => {
      const docs = s.docs.map(d=>({ id: d.id, ...d.data() }));
      setComments(docs);

      // fetch user display names for any unknown user ids
      const uids = Array.from(new Set(docs.map(d=>d.createdBy).filter(Boolean)));
      uids.forEach(async (uid) => {
        if (!uid || usersMap[uid]) return;
        try {
          const udoc = await getDoc(doc(db, 'users', uid));
          if (udoc.exists()) setUsersMap(prev=>({ ...prev, [uid]: udoc.data() }));
        } catch (err) {
          console.error('failed to fetch user', uid, err);
        }
      });
    });

    // admin-only notes subcollection listener
    let unsubNotes = () => {};
    if (user && user.role === 'admin') {
      const nq = query(collection(db,'complaints',id,'notes'), orderBy('createdAt','asc'));
      unsubNotes = onSnapshot(nq, s => setNotes(s.docs.map(d=>({ id: d.id, ...d.data() }))));
    }

    return ()=>{
      unsubComments();
      unsubNotes();
      unsubDoc();
    };
  },[id]);

  async function handleAddComment(e){
    e.preventDefault();
    setError('');
    if(!user || !user.uid) return setError('You must be signed in to comment');
    if(!commentText.trim()) return setError('Comment cannot be empty');
    try{
      // optimistic UI: add a temporary comment locally
      const temp = { id: `tmp-${Date.now()}`, text: commentText.trim(), createdBy: user.uid, createdAt: new Date(), pending: true };
      setComments(prev => [...prev, temp]);
      setCommentText('');
      await addDoc(collection(db,'complaints',id,'comments'),{
        text: temp.text,
        createdBy: temp.createdBy,
        createdAt: serverTimestamp()
      });
    }catch(err){
      console.error(err);
      setError('Failed to add comment');
    }
  }

  async function handleDeleteComment(commentId){
    if (!commentId) return;
    // optimistic remove
    setComments(prev => prev.filter(c => c.id !== commentId));
    // if temp id, nothing to delete remotely
    if (String(commentId).startsWith('tmp-')) return;
    try{
      await deleteDoc(doc(db,'complaints',id,'comments',commentId));
    }catch(err){
      console.error(err);
      setError('Failed to delete comment');
    }
  }

  async function handleAddAdminNote(e){
    e.preventDefault();
    if (!user || user.role !== 'admin') return setError('Not authorized');
    if (!adminNoteText.trim()) return setError('Note cannot be empty');
    try{
      await addDoc(collection(db,'complaints',id,'notes'),{
        text: adminNoteText.trim(),
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });
      setAdminNoteText('');
    }catch(err){
      console.error(err);
      setError('Failed to add note');
    }
  }

  if (loading) return <div style={{padding:20}}>Loading...</div>;
  if (!complaint) return <div style={{padding:20}}>Complaint not found</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>{complaint.title}</h2>
      <div style={{ color: '#666', marginBottom: 8 }}>{complaint.category} • {complaint.status || 'open'}</div>
      {complaint.image ? (
        <div style={{ marginBottom: 12 }}>
          <img src={complaint.image} alt={complaint.title} style={{ maxWidth: '100%', maxHeight: 480 }} />
        </div>
      ) : null}
      <p style={{ whiteSpace: 'pre-wrap' }}>{complaint.description}</p>

      <div style={{ marginTop: 24 }}>
        <h3>Comments</h3>
        {comments.length === 0 && <div style={{ color: '#777' }}>No comments yet.</div>}
        <div>
          {comments.map(c=> (
            <div key={c.id} style={{ borderBottom: '1px solid #eee', padding: '8px 0', opacity: c.pending ? 0.7 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: '#555' }}>{(usersMap[c.createdBy] && usersMap[c.createdBy].name) || c.createdBy} • {c.createdAt ? (c.createdAt.toDate ? c.createdAt.toDate().toLocaleString() : new Date(c.createdAt).toLocaleString()) : ''}</div>
                <div>
                  {(user && user.role === 'admin') && <button onClick={()=>handleDeleteComment(c.id)} style={{ marginLeft: 8 }}>Delete</button>}
                </div>
              </div>
              <div style={{ marginTop: 6 }}>{c.text}</div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddComment} style={{ marginTop: 12 }}>
          {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}
          <textarea value={commentText} onChange={e=>setCommentText(e.target.value)} rows={3} placeholder="Add a comment" style={{ width: '100%', padding:8 }} />
          <div style={{ marginTop: 8 }}>
            <button type="submit">Post Comment</button>
          </div>
        </form>
      </div>
      {user && user.role === 'admin' && (
        <div style={{ marginTop: 24 }}>
          <h3>Internal Notes</h3>
          {notes.length === 0 && <div style={{ color: '#777' }}>No notes yet.</div>}
          <div>
            {notes.map(n=> (
              <div key={n.id} style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
                <div style={{ fontSize: 12, color: '#555' }}>{(usersMap[n.createdBy] && usersMap[n.createdBy].name) || n.createdBy} • {n.createdAt ? (n.createdAt.toDate ? n.createdAt.toDate().toLocaleString() : new Date(n.createdAt).toLocaleString()) : ''}</div>
                <div style={{ marginTop: 6 }}>{n.text}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddAdminNote} style={{ marginTop: 12 }}>
            <textarea value={adminNoteText} onChange={e=>setAdminNoteText(e.target.value)} rows={3} placeholder="Add internal note" style={{ width: '100%', padding:8 }} />
            <div style={{ marginTop: 8 }}>
              <button type="submit">Add Note</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
