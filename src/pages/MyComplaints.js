import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/* ---------------- Status Badge Styles ---------------- */
const getStatusStyles = (status = 'pending') => {
  switch (status) {
    case 'resolved':
      return 'bg-green-100 text-green-800';
    case 'in-progress':
      return 'bg-amber-100 text-amber-800';
    case 'closed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export default function MyComplaints() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- Firestore Listener ---------------- */
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'complaints'),
      where('createdBy', '==', user.uid), // ✅ AUTH UID
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComplaints(data);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching complaints:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  /* ---------------- Loading State ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading your complaints…
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#F6F8FA] px-4 py-10"
    >
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          My Complaints
        </h1>

        {complaints.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
            <p className="text-gray-600">
              You haven’t submitted any complaints yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((c) => (
              <motion.div
                key={c.id}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                onClick={() => navigate(`/complaint/${c.id}`)}
                className="bg-white rounded-2xl shadow-sm p-5 cursor-pointer border border-transparent hover:border-blue-500"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {c.title || 'Untitled Complaint'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {c.category || 'General'}
                    </p>
                  </div>

                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusStyles(
                      c.status
                    )}`}
                  >
                    {c.status || 'pending'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mt-2">
                  {(c.description || '').slice(0, 150)}
                  {c.description?.length > 150 && '…'}
                </p>

                <p className="text-xs text-gray-400 mt-3">
                  {c.createdAt?.toDate
                    ? c.createdAt.toDate().toLocaleDateString()
                    : 'No date'}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
