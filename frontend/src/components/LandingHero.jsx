import React, { useEffect, useState } from 'react';

const LandingHero = ({ onEnterWebsite }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Logo plays intro for ~1.8 seconds and then fades out
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => {
        if (onEnterWebsite) {
          onEnterWebsite();
        }
      }, 500);
    }, 1800);

    return () => clearTimeout(timer);
  }, [onEnterWebsite]);

  return (
    <div className={`splash-container ${exiting ? 'fade-out' : ''}`}>
      <div className="splash-logo-box">
        <div className="splash-logo-icon">
          B
        </div>
        <h1 className="splash-logo-text">
          <span className="gradient-text">Bloggora</span>
        </h1>
      </div>
    </div>
  );
};

export default LandingHero;
