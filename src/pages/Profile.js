import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Profile(){
  const { user } = useAuth();
  if(!user) return null;
  return (
    <div style={{padding:20}}>
      <h2>Profile</h2>
      <div>Name: {user.name}</div>
      <div>Email: {user.email}</div>
      <div>Role: {user.role}</div>
    </div>
  );
}
