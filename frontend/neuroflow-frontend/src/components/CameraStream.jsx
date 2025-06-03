import React from 'react';
import '../styles/CameraStream.css';

export default function CameraStream() {
  return (
    <div className='camera-feed'>
      <h2 className='camera-title'>Live Camera Feed</h2>
      <div className='camera-image-container'>
        <img
          src="http://10.205.145.102:8500/video_feed"
          alt="Live Feed"
          className='camera-image'
        />
      </div>
    </div>
  );
}