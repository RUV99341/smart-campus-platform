import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role === 'admin') {
      const usersCollection = collection(db, 'users');
      const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersData);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleRoleChange = async (userId, newRole) => {
    if (!userId || !newRole) return;
    const userRef = doc(db, 'users', userId);
    try {
      await updateDoc(userRef, { role: newRole });
    } catch (error) {
      console.error("Failed to update user role:", error);
      alert('Failed to update user role. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user && user.role !== 'admin') {
    return <div>You do not have permission to view this page.</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>User Management</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Name</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Email</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Role</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{u.name}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{u.email}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{u.role}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                  <select defaultValue={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}>
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
