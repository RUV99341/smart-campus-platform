
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box,
  LinearProgress
} from '@mui/material';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function Feed() {
  const [complaints, setComplaints] = useState([]);
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      const complaintsData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setComplaints(complaintsData);
      
      const completed = complaintsData.filter(c => c.status === 'resolved').length;
      setProgress(Math.round((completed / complaintsData.length) * 100) || 0);
    });
    return unsub;
  }, []);

  async function toggleUpvote(c) {
    const docRef = doc(db, 'complaints', c.id);
    const has = c.upvotes && c.upvotes.includes(user.uid);
    if (has) await updateDoc(docRef, { upvotes: arrayRemove(user.uid) });
    else await updateDoc(docRef, { upvotes: arrayUnion(user.uid) });
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              #VoteReady Actions
            </Typography>
            <Grid container spacing={2}>
              {complaints.map(c => (
                <Grid item xs={12} sm={6} md={4} key={c.id}>
                  <Card sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0px 4px 20px rgba(0,0,0,0.05)',
                    borderRadius: '15px'
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          50 PTS
                        </Typography>
                      </Box>
                      <Typography variant="h6" component="div" sx={{ mb: 1.5 }}>
                        {c.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Time left: {new Date(c.createdAt?.toDate()).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Link to={`/complaint/${c.id}`} style={{ textDecoration: 'none' }}>
                        <Button variant="contained" fullWidth sx={{
                          backgroundColor: '#007bff',
                          borderRadius: '10px',
                          '&:hover': {
                            backgroundColor: '#0056b3'
                          }
                        }}>
                          To Do
                        </Button>
                      </Link>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{
            boxShadow: '0px 4px 20px rgba(0,0,0,0.05)',
            borderRadius: '15px',
            p: 2
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Progress
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <div style={{ width: 150, height: 150 }}>
                  <CircularProgressbar
                    value={progress}
                    text={`${progress}%`}
                    styles={buildStyles({
                      pathColor: '#007bff',
                      textColor: '#007bff',
                      trailColor: '#d6d6d6',
                    })}
                  />
                </div>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>Find your next election</Typography>
                <LinearProgress variant="determinate" value={100} sx={{ mb: 1.5 }}/>
                
                <Typography variant="body2" sx={{ mb: 1 }}>Check Registration Status</Typography>
                <LinearProgress variant="determinate" value={75} sx={{ mb: 1.5 }}/>

                <Typography variant="body2" sx={{ mb: 1 }}>Select Voting Method</Typography>
                <LinearProgress variant="determinate" value={50} sx={{ mb: 1.5 }}/>

                <Typography variant="body2" sx={{ mb: 1 }}>Check Out Ballot Guide</Typography>
                <LinearProgress variant="determinate" value={25} sx={{ mb: 1.5 }}/>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
