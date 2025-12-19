import React, { useState } from 'react';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function ForgotPassword(){
  const [email,setEmail] = useState('');
  const [sent,setSent] = useState(false);

  async function handleSubmit(e){
    e.preventDefault();
    try{
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    }catch(err){
      console.error(err);
      alert('Unable to send reset email.');
    }
  }

  return (
    <div style={{padding:24,maxWidth:540,margin:'24px auto'}}>
      <h2>Reset password</h2>
      {sent ? (
        <div>A password reset email has been sent to {email}.</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Your email" value={email} onChange={e=>setEmail(e.target.value)} required style={{padding:10,width:'100%',boxSizing:'border-box'}} />
          <div style={{marginTop:12}}>
            <button type="submit" className="btn-primary">Send reset email</button>
          </div>
        </form>
      )}
    </div>
  );
}
