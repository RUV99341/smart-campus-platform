import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, updateDoc } from 'firebase/firestore';
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

  useEffect(()=> {
    if(!id) return;
    const ref = doc(db,'complaints',id);
    let unsubDoc = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setComplaint({ id: snap.id, ...snap.data() });
      } else {
        setComplaint(null);
      }
      setLoading(false);
    });

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

    return ()=> {
      unsubComments();
      unsubNotes();
      unsubDoc();
    };
  },[id, user]);

  async function handleAddComment(e){
    e.preventDefault();
    setError('');
    if(!user || !user.uid) return setError('You must be signed in to comment');
    if(!commentText.trim()) return setError('Comment cannot be empty');
    try{
      await addDoc(collection(db,'complaints',id,'comments'),{
        text: commentText.trim(),
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });
      setCommentText('');
    }catch(err){
      console.error(err);
      setError('Failed to add comment');
    }
  }

  async function handleDeleteComment(commentId){
    if (!commentId) return;
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

  async function handleStatusChange(e) {
    const newStatus = e.target.value;
    if (!newStatus || !id) return;
    const ref = doc(db, 'complaints', id);
    try {
      await updateDoc(ref, { status: newStatus });
      // The onSnapshot listener will automatically update the UI
    } catch (err) {
      console.error("Failed to update status:", err);
      setError("Failed to update status. Please try again.");
    }
  }

  if (loading) return <div style={{padding:20}}>Loading...</div>;
  if (!complaint) return <div style={{padding:20}}>Complaint not found</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>{complaint.title}</h2>
      <div style={{ color: '#666', marginBottom: 8, display: 'flex', alignItems: 'center' }}>
        <span>{complaint.category} • <span style={{textTransform: 'capitalize'}}>{complaint.status || 'open'}</span></span>
        {user && user.role === 'admin' && (
          <select value={complaint.status || 'open'} onChange={handleStatusChange} style={{ marginLeft: 10, padding: '2px 4px'}}>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        )}
      </div>

      {complaint.image ? (
        <div style={{ marginBottom: 12 }}>
          <img src={complaint.image} alt={complaint.title} style={{ maxWidth: '100%', maxHeight: 480, borderRadius: 4 }} />
        </div>
      ) : null}
      <p style={{ whiteSpace: 'pre-wrap' }}>{complaint.description}</p>

      <div style={{ marginTop: 24 }}>
        <h3>Comments</h3>
        {comments.length === 0 && <div style={{ color: '#777' }}>No comments yet.</div>}
        <div>
          {comments.map(c=> (
            <div key={c.id} style={{ borderBottom: '1px solid #eee', padding: '8px 0'}}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: '#555' }}>
                  <b>{(usersMap[c.createdBy] && usersMap[c.createdBy].name) || 'User'}</b> • {c.createdAt ? (c.createdAt.toDate ? c.createdAt.toDate().toLocaleString() : new Date(c.createdAt).toLocaleString()) : ''}
                </div>
                <div>
                  {(user && (user.role === 'admin' || user.uid === c.createdBy)) && <button onClick={()=>handleDeleteComment(c.id)} style={{ marginLeft: 8, padding: '2px 6px' }}>Delete</button>}
                </div>
              </div>
              <div style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>{c.text}</div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddComment} style={{ marginTop: 12 }}>
          {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}
          <textarea value={commentText} onChange={e=>setCommentText(e.target.value)} rows={3} placeholder="Add a public comment" style={{ width: '100%', padding:8, boxSizing: 'border-box' }} />
          <div style={{ marginTop: 8 }}>
            <button type="submit">Post Comment</button>
          </div>
        </form>
      </div>

      {user && user.role === 'admin' && (
        <div style={{ marginTop: 24, background: '#f8f9fa', padding: 12, borderRadius: 4 }}>
          <h3>Internal Notes</h3>
          {notes.length === 0 && <div style={{ color: '#777' }}>No notes yet.</div>}
          <div>
            {notes.map(n=> (
              <div key={n.id} style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
                <div style={{ fontSize: 12, color: '#555' }}><b>{(usersMap[n.createdBy] && usersMap[n.createdBy].name) || 'User'}</b> • {n.createdAt ? (n.createdAt.toDate ? n.createdAt.toDate().toLocaleString() : new Date(n.createdAt).toLocaleString()) : ''}</div>
                <div style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>{n.text}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddAdminNote} style={{ marginTop: 12 }}>
            <textarea value={adminNoteText} onChange={e=>setAdminNoteText(e.target.value)} rows={3} placeholder="Add an internal note for other admins" style={{ width: '100%', padding:8, boxSizing: 'border-box' }} />
            <div style={{ marginTop: 8 }}>
              <button type="submit">Add Note</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
