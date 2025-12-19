import React from 'react';
import LoginForm from './LoginForm';
import Footer from './Footer';
import './landing.css';

export default function Landing() {
  return (
    <div className="landing-root">
      <div className="landing-left">
        <div className="phone-mock">
          <div className="phone-cards">
            <div className="card card-main">Photo collage</div>
            <div className="card card-back card-left" />
            <div className="card card-back card-right" />
          </div>
        </div>
      </div>

      <div className="landing-right">
        <LoginForm />
        <Footer />
      </div>
    </div>
  );
}
