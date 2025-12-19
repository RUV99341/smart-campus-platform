import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ShortcutsPanel(){
  const navigate = useNavigate();
  return (
    <div>
      <h4>Shortcuts</h4>
      <div className="shortcuts">
        <button onClick={()=>navigate('/submit')}>Raise Complaint</button>
        <button onClick={()=>navigate('/my-complaints')}>View My Complaints</button>
        <button onClick={()=>window.location.href='mailto:admin@smartcampus.example'}>Contact Admin</button>
      </div>
    </div>
  );
}
