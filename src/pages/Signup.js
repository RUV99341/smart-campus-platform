import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Signup(){
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleGoogle(){
    try{
      await signInWithGoogle();
      navigate('/home');
    }catch(e){
      console.error(e);
      alert('Sign up failed');
    }
  }

  return (
    <div style={{padding:24,maxWidth:560,margin:'24px auto'}}>
      <h2>Create an account</h2>
      <p>Sign up quickly using your Google account.</p>
      <button className="btn-google" onClick={handleGoogle}>Continue with Google</button>
      <div style={{marginTop:16}}>
        <small>Or contact your campus admin to create an account.</small>
      </div>
    </div>
  );
}
