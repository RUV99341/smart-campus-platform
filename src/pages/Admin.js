import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';

export default function Admin(){
  const [complaints,setComplaints] = useState([]);

  useEffect(()=>{
    const q = query(collection(db,'complaints'), orderBy('createdAt','desc'));
    const unsub = onSnapshot(q,snap=> setComplaints(snap.docs.map(d=>({id:d.id, ...d.data()}))));
    return unsub;
  },[]);

  async function setStatus(id,status){
    const docRef = doc(db,'complaints',id);
    await updateDoc(docRef,{ status });
  }

  return (
    <div style={{padding:20}}>
      <h2>Admin Panel</h2>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead>
          <tr><th>Title</th><th>By</th><th>Status</th><th>Action</th></tr>
        </thead>
        <tbody>
          {complaints.map(c=> (
            <tr key={c.id} style={{borderTop:'1px solid #ddd'}}>
              <td>{c.title}</td>
              <td>{c.createdBy}</td>
              <td>{c.status}</td>
              <td>
                <button onClick={()=>setStatus(c.id,'open')}>Open</button>
                <button onClick={()=>setStatus(c.id,'resolved')} style={{marginLeft:8}}>Resolve</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
