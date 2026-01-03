
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel 
} from '@mui/material';

export default function ComplaintDetail() {
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

  useEffect(() => {
    if (!id) return;
    const ref = doc(db, 'complaints', id);
    let unsubDoc = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setComplaint({ id: snap.id, ...snap.data() });
      } else {
        setComplaint(null);
      }
      setLoading(false);
    });

    const q = query(collection(db, 'complaints', id, 'comments'), orderBy('createdAt', 'asc'));
    const unsubComments = onSnapshot(q, s => {
      const docs = s.docs.map(d => ({ id: d.id, ...d.data() }));
      setComments(docs);

      const uids = Array.from(new Set(docs.map(d => d.createdBy).filter(Boolean)));
      uids.forEach(async (uid) => {
        if (!uid || usersMap[uid]) return;
        try {
          const udoc = await getDoc(doc(db, 'users', uid));
          if (udoc.exists()) setUsersMap(prev => ({ ...prev, [uid]: udoc.data() }));
        } catch (err) {
          console.error('failed to fetch user', uid, err);
        }
      });
    });

    let unsubNotes = () => {};
    if (user && user.role === 'admin') {
      const nq = query(collection(db, 'complaints', id, 'notes'), orderBy('createdAt', 'asc'));
      unsubNotes = onSnapshot(nq, s => setNotes(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    }

    return () => {
      unsubComments();
      unsubNotes();
      unsubDoc();
    };
  }, [id, user]);

  async function handleAddComment(e) {
    e.preventDefault();
    setError('');
    if (!user || !user.uid) return setError('You must be signed in to comment');
    if (!commentText.trim()) return setError('Comment cannot be empty');
    try {
      await addDoc(collection(db, 'complaints', id, 'comments'), {
        text: commentText.trim(),
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });
      setCommentText('');
    } catch (err) {
      console.error(err);
      setError('Failed to add comment');
    }
  }

  async function handleDeleteComment(commentId) {
    if (!commentId) return;
    try {
      await deleteDoc(doc(db, 'complaints', id, 'comments', commentId));
    } catch (err) {
      console.error(err);
      setError('Failed to delete comment');
    }
  }

  async function handleAddAdminNote(e) {
    e.preventDefault();
    if (!user || user.role !== 'admin') return setError('Not authorized');
    if (!adminNoteText.trim()) return setError('Note cannot be empty');
    try {
      await addDoc(collection(db, 'complaints', id, 'notes'), {
        text: adminNoteText.trim(),
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });
      setAdminNoteText('');
    } catch (err) {
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
    } catch (err) {
      console.error("Failed to update status:", err);
      setError("Failed to update status. Please try again.");
    }
  }

  if (loading) return <Container sx={{ mt: 4 }}><Typography>Loading...</Typography></Container>;
  if (!complaint) return <Container sx={{ mt: 4 }}><Typography>Complaint not found</Typography></Container>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card sx={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.05)', borderRadius: '15px', p: 3 }}>
            <CardContent>
              <Typography variant="h4" gutterBottom>{complaint.title}</Typography>
              <Box sx={{ color: '#666', mb: 2, display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1">{complaint.category} • <span style={{ textTransform: 'capitalize' }}>{complaint.status || 'open'}</span></Typography>
                {user && user.role === 'admin' && (
                  <FormControl size="small" sx={{ ml: 2, minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select value={complaint.status || 'open'} onChange={handleStatusChange} label="Status">
                      <MenuItem value="open">Open</MenuItem>
                      <MenuItem value="in-progress">In Progress</MenuItem>
                      <MenuItem value="resolved">Resolved</MenuItem>
                      <MenuItem value="closed">Closed</MenuItem>
                    </Select>
                  </FormControl>
                )}
              </Box>

              {complaint.image && (
                <Box sx={{ mb: 3, borderRadius: '10px', overflow: 'hidden' }}>
                  <img src={complaint.image} alt={complaint.title} style={{ width: '100%', height: 'auto' }} />
                </Box>
              )}
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{complaint.description}</Typography>
            </CardContent>
          </Card>

          <Card sx={{ mt: 4, boxShadow: '0px 4px 20px rgba(0,0,0,0.05)', borderRadius: '15px', p: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>Comments</Typography>
              {comments.length === 0 && <Typography color="text.secondary">No comments yet.</Typography>}
              <Box sx={{ mt: 2 }}>
                {comments.map(c => (
                  <Box key={c.id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: '10px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        <b>{(usersMap[c.createdBy] && usersMap[c.createdBy].name) || 'User'}</b> • {c.createdAt ? (c.createdAt.toDate ? c.createdAt.toDate().toLocaleString() : new Date(c.createdAt).toLocaleString()) : ''}
                      </Typography>
                      {(user && (user.role === 'admin' || user.uid === c.createdBy)) && 
                        <Button size="small" onClick={() => handleDeleteComment(c.id)}>Delete</Button>
                      }
                    </Box>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{c.text}</Typography>
                  </Box>
                ))}
              </Box>

              <form onSubmit={handleAddComment} style={{ marginTop: 20 }}>
                {error && <Typography color="error" sx={{ mb: 1 }}>{error}</Typography>}
                <TextField 
                  value={commentText} 
                  onChange={e => setCommentText(e.target.value)} 
                  multiline 
                  rows={4} 
                  placeholder="Add a public comment" 
                  fullWidth
                  variant="outlined"
                />
                <Button type="submit" variant="contained" sx={{ mt: 2 }}>Post Comment</Button>
              </form>
            </CardContent>
          </Card>

          {user && user.role === 'admin' && (
            <Card sx={{ mt: 4, boxShadow: '0px 4px 20px rgba(0,0,0,0.05)', borderRadius: '15px', p: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>Internal Notes</Typography>
                {notes.length === 0 && <Typography color="text.secondary">No notes yet.</Typography>}
                <Box sx={{ mt: 2 }}>
                  {notes.map(n => (
                    <Box key={n.id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: '10px' }}>
                      <Typography variant="body2" color="text.secondary">
                        <b>{(usersMap[n.createdBy] && usersMap[n.createdBy].name) || 'User'}</b> • {n.createdAt ? (n.createdAt.toDate ? n.createdAt.toDate().toLocaleString() : new Date(n.createdAt).toLocaleString()) : ''}
                      </Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{n.text}</Typography>
                    </Box>
                  ))}
                </Box>
                <form onSubmit={handleAddAdminNote} style={{ marginTop: 20 }}>
                  <TextField 
                    value={adminNoteText} 
                    onChange={e => setAdminNoteText(e.target.value)} 
                    multiline 
                    rows={4} 
                    placeholder="Add an internal note for other admins" 
                    fullWidth
                    variant="outlined"
                  />
                  <Button type="submit" variant="contained" sx={{ mt: 2 }}>Add Note</Button>
                </form>
              </CardContent>
            </Card>
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          {/* Placeholder for the progress component or other sidebar content */}
        </Grid>
      </Grid>
    </Container>
  );
}
