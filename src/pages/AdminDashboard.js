import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

function shorten(text, n = 120) {
  if (!text) return '';
  return text.length > n ? text.slice(0, n) + '…' : text;
}

function exportToCSV(items) {
  if (!items || !items.length) return;
  const headers = ['title', 'description', 'category', 'status', 'createdBy', 'createdAt'];
  const rows = items.map(i => [
    `"${(i.title || '').replace(/"/g,'""')}"`,
    `"${(i.description || '').replace(/"/g,'""')}"`,
    i.category || '',
    i.status || '',
    i.createdBy || '',
    i.createdAt ? (i.createdAt.toDate ? i.createdAt.toDate().toISOString() : new Date(i.createdAt).toISOString()) : ''
  ].join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `complaints-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function AdminDashboard(){
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(()=>{
    const q = query(collection(db,'complaints'), orderBy('createdAt','desc'));
    const unsub = onSnapshot(q, snap => setComplaints(snap.docs.map(d=>({ id: d.id, ...d.data() }))) );
    return unsub;
  },[]);

  const categories = useMemo(()=>{
    const set = new Set(complaints.map(c=>c.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  },[complaints]);

  const statuses = useMemo(()=>{
    const set = new Set(complaints.map(c=>c.status || 'open'));
    return ['All', ...Array.from(set)];
  },[complaints]);

  const filtered = complaints.filter(c=>{
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== 'All' && c.category !== categoryFilter) return false;
    if (statusFilter !== 'All' && (c.status || 'open') !== statusFilter) return false;
    return true;
  });

  async function markSolved(id){
    try{
      const ref = doc(db,'complaints',id);
      await updateDoc(ref,{ status: 'solved' });
    }catch(err){
      console.error(err);
      alert('Failed to update status');
    }
  }

  if (!user) return null;

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Dashboard</h2>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <input placeholder="Search by title" value={search} onChange={e=>setSearch(e.target.value)} style={{ padding:8, flex: '1 1 300px' }} />
        <select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} style={{ padding:8 }}>
          {categories.map(c=> <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{ padding:8 }}>
          {statuses.map(s=> <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={()=>exportToCSV(filtered)} style={{ padding: '8px 12px' }}>Export CSV</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Title</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Description</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Category</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Status</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Created By</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Timestamp</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c=> (
              <tr key={c.id}>
                <td style={{ padding:8, borderBottom: '1px solid #f0f0f0' }}>{c.title}</td>
                <td style={{ padding:8, borderBottom: '1px solid #f0f0f0' }}>{shorten(c.description, 140)}</td>
                <td style={{ padding:8, borderBottom: '1px solid #f0f0f0' }}>{c.category}</td>
                <td style={{ padding:8, borderBottom: '1px solid #f0f0f0' }}>{c.status || 'open'}</td>
                <td style={{ padding:8, borderBottom: '1px solid #f0f0f0' }}>{c.createdBy}</td>
                <td style={{ padding:8, borderBottom: '1px solid #f0f0f0' }}>{c.createdAt ? (c.createdAt.toDate ? c.createdAt.toDate().toLocaleString() : new Date(c.createdAt).toLocaleString()) : ''}</td>
                <td style={{ padding:8, borderBottom: '1px solid #f0f0f0' }}>
                  <button onClick={()=>navigate(`/complaint/${c.id}`)} style={{ marginRight: 8 }}>View</button>
                  {c.status !== 'solved' && <button onClick={()=>markSolved(c.id)} style={{ marginRight: 8 }}>Mark as Solved</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
