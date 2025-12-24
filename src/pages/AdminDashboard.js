import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

function shorten(text, n = 120) {
  if (!text) return '';
  return text.length > n ? text.slice(0, n) + '…' : text;
}

async function exportToCSV(items, users) {
  if (!items || !items.length) return;
  const headers = ['title', 'description', 'category', 'status', 'author_name', 'author_email', 'createdAt'];
  const rows = items.map(i => {
    const u = users[i.createdBy] || {};
    return [
      `"${(i.title || '').replace(/"/g, '""')}"`,
      `"${(shorten(i.description, 140) || '').replace(/"/g, '""')}"`,
      i.category || '',
      i.status || '',
      u.name || '',
      u.email || '',
      i.createdAt ? (i.createdAt.toDate ? i.createdAt.toDate().toISOString() : new Date(i.createdAt).toISOString()) : ''
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `complaints-export-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const PAGE_SIZE = 10;

export default function AdminDashboard(){
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(()=>{
    const q = query(collection(db,'complaints'), orderBy('createdAt','desc'));
    const unsub = onSnapshot(q, snap => setComplaints(snap.docs.map(d=>({ id: d.id, ...d.data() }))) );

    async function fetchUsers() {
      const usersSnap = await getDocs(collection(db, 'users'));
      const uMap = {};
      usersSnap.forEach(doc => uMap[doc.id] = doc.data());
      setUsersMap(uMap);
    }
    fetchUsers();

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

  const filtered = useMemo(() => complaints.filter(c=>{
    const searchTerm = search.toLowerCase();
    const author = usersMap[c.createdBy] || {};
    const inTitle = c.title.toLowerCase().includes(searchTerm);
    const inAuthorName = (author.name || '').toLowerCase().includes(searchTerm);
    const inAuthorEmail = (author.email || '').toLowerCase().includes(searchTerm);

    if (search && !(inTitle || inAuthorName || inAuthorEmail)) return false;
    if (categoryFilter !== 'All' && c.category !== categoryFilter) return false;
    if (statusFilter !== 'All' && (c.status || 'open') !== statusFilter) return false;
    return true;
  }), [complaints, search, categoryFilter, statusFilter, usersMap]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  async function markSolved(id){
    try{
      const ref = doc(db,'complaints',id);
      await updateDoc(ref,{ status: 'resolved' });
    }catch(err){
      console.error(err);
      alert('Failed to update status');
    }
  }

  if (!user) return null;

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Dashboard</h2>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
        <input placeholder="Search title, author, email..." value={search} onChange={e=>{ setSearch(e.target.value); setCurrentPage(1); }} style={{ padding:8, flex: '1 1 300px' }} />
        <select value={categoryFilter} onChange={e=>{ setCategoryFilter(e.target.value); setCurrentPage(1); }} style={{ padding:8 }}>
          {categories.map(c=> <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={e=>{ setStatusFilter(e.target.value); setCurrentPage(1); }} style={{ padding:8 }}>
          {statuses.map(s=> <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
        </select>
        <button onClick={()=>exportToCSV(filtered, usersMap)} style={{ padding: '8px 12px' }}>Export CSV</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Title', 'Author', 'Category', 'Status', 'Timestamp', 'Actions'].map(h => 
                <th key={h} style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8, background: '#f8f9fa' }}>{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginated.map(c=> (
              <tr key={c.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding:8 }}>{c.title}</td>
                <td style={{ padding:8 }}>{(usersMap[c.createdBy] && usersMap[c.createdBy].name) || 'N/A'}</td>
                <td style={{ padding:8 }}>{c.category}</td>
                <td style={{ padding:8, textTransform: 'capitalize' }}>{c.status || 'open'}</td>
                <td style={{ padding:8 }}>{c.createdAt ? (c.createdAt.toDate ? c.createdAt.toDate().toLocaleString() : new Date(c.createdAt).toLocaleString()) : ''}</td>
                <td style={{ padding:8 }}>
                  <button onClick={()=>navigate(`/complaint/${c.id}`)} style={{ marginRight: 8 }}>View</button>
                  {c.status !== 'resolved' && c.status !== 'closed' && <button onClick={()=>markSolved(c.id)}>Mark Resolved</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 16 }}>
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</button>
          <span style={{ margin: '0 12px' }}>Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
        </div>
      )}
    </div>
  );
}
