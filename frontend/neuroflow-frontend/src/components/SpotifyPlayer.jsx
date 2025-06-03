// // Enhanced Spotify Player with progress bar and device transfer
// import React, { useState, useEffect } from "react";
// import {
//   FaPlay,
//   FaPause,
//   FaForward,
//   FaBackward,
//   FaSignOutAlt,
// } from "react-icons/fa";
// import { useSpotify } from "../context/SpotifyContext";
// import "../styles/SpotifyPlayer.css";

// const formatTime = (ms) => {
//   const totalSeconds = Math.floor(ms / 1000);
//   const minutes = Math.floor(totalSeconds / 60);
//   const seconds = totalSeconds % 60;
//   return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
// };

// const SpotifyPlayer = () => {
//   const { player, isActive, currentTrack, login, deviceId, token } =
//     useSpotify();

//   const [isPaused, setIsPaused] = useState(true);
//   const [position, setPosition] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const [availableDevices, setAvailableDevices] = useState([]);
//   const [isSeeking, setIsSeeking] = useState(false);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (player) {
//         player.getCurrentState().then((state) => {
//           if (state) {
//             setIsPaused(state.paused);
//             setPosition(state.position);
//             setDuration(state.duration);
//           }
//         });
//       }
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [player]);

//   const togglePlay = () => {
//     player.togglePlay().then(() => setIsPaused((prev) => !prev));
//   };

//   const nextTrack = () => player.nextTrack();
//   const previousTrack = () => player.previousTrack();

//   const fetchDevices = async () => {
//     try {
//       const res = await fetch("https://api.spotify.com/v1/me/player/devices", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       const data = await res.json();
//       setAvailableDevices(data.devices || []);
//     } catch (err) {
//       console.error("Error fetching devices", err);
//     }
//   };

//   const transferToDevice = async (id) => {
//     try {
//       await fetch("https://api.spotify.com/v1/me/player", {
//         method: "PUT",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ device_ids: [id], play: true }),
//       });
//     } catch (err) {
//       console.error("Error transferring playback", err);
//     }
//   };

//   if (!isActive) {
//     return (
//       <div className="spotify-player-container">
//         <div className="initial-message">
//           <h2>Connect to Spotify</h2>
//           <button onClick={login} className="login-button">
//             Login with Spotify
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="spotify-player-container">
//       {currentTrack && (
//         <>
//           <div className="track-info">
//             <img
//               src={currentTrack.album.images[0]?.url}
//               alt="Album Cover"
//               className="album-art"
//             />
//             <div className="track-details">
//               <h3>{currentTrack.name}</h3>
//               <p>{currentTrack.artists.map((a) => a.name).join(", ")}</p>
//             </div>
//           </div>

//           <div className="progress-bar-container">
//             <span>{formatTime(position)}</span>
//             <input
//               type="range"
//               className="progress-bar"
//               min="0"
//               max={duration}
//               value={position}
//               onChange={(e) => {
//                 setIsSeeking(true);
//                 setPosition(Number(e.target.value));
//               }}
//               onMouseUp={(e) => {
//                 seekToPosition(Number(e.target.value));
//                 setIsSeeking(false);
//               }}
//               onTouchEnd={(e) => {
//                 seekToPosition(Number(e.target.value));
//                 setIsSeeking(false);
//               }}
//             />

//             <span>{formatTime(duration)}</span>
//           </div>

//           <div className="player-controls">
//             <button onClick={previousTrack} className="control-button">
//               <FaBackward />
//             </button>
//             <button onClick={togglePlay} className="control-button play-pause">
//               {isPaused ? <FaPlay /> : <FaPause />}
//             </button>
//             <button onClick={nextTrack} className="control-button">
//               <FaForward />
//             </button>
//           </div>

//           <div className="transfer-message">
//             {availableDevices.length > 0 && (
//               <div className="device-message">
//                 {availableDevices.map((dev) => (
//                   <div key={dev.id}>
//                     <button onClick={() => transferToDevice(dev.id)}>
//                       {dev.name} {dev.is_active ? "(Active)" : ""}
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default SpotifyPlayer;

import React, { useState, useEffect } from "react";
import {
  FaPlay,
  FaPause,
  FaForward,
  FaBackward,
  FaSignOutAlt,
  FaSpotify,
} from "react-icons/fa";
import { useSpotify } from "../context/SpotifyContext";
import "../styles/SpotifyPlayer.css";

const formatTime = (ms) => {
  if (!ms) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

const SpotifyPlayer = () => {
  const {
    player,
    isActive,
    currentTrack,
    login,
    deviceId,
    isPaused,
    togglePlay,
    nextTrack,
    previousTrack,
    position,
    duration,
    seekToPosition,
    availableDevices,
    fetchDevices,
    transferToDevice,
    logout,
  } = useSpotify();

  const [isSeeking, setIsSeeking] = useState(false);
  const [showDevices, setShowDevices] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);

  // Update current position when not seeking
  useEffect(() => {
    if (!isSeeking) {
      setCurrentPosition(position);
    }
  }, [position, isSeeking]);

  const handleSeekChange = (e) => {
    setIsSeeking(true);
    setCurrentPosition(Number(e.target.value));
  };

  const handleSeek = (e) => {
    seekToPosition(Number(e.target.value));
    setIsSeeking(false);
  };

  const handleDeviceToggle = async () => {
    if (!showDevices) {
      await fetchDevices();
    }
    setShowDevices(!showDevices);
  };

  if (!isActive) {
    return (
      <div className="spotify-player-container">
        <div className="initial-message">
          <FaSpotify size={32} />
          <h2>Connect to Spotify</h2>
          <button onClick={login} className="login-button">
            Login with Spotify
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="spotify-player-container">
      {currentTrack && (
        <>
          <div className="track-info">
            <img
              src={currentTrack.album.images[0]?.url}
              alt="Album Cover"
              className="album-art"
            />
            <div className="track-details">
              <h3>{currentTrack.name}</h3>
              <p>{currentTrack.artists.map((a) => a.name).join(", ")}</p>
            </div>
          </div>

          <div className="progress-bar-container">
            <span>{formatTime(currentPosition)}</span>
            <input
              type="range"
              className="progress-bar"
              min="0"
              max={duration || 100}
              value={currentPosition}
              onChange={handleSeekChange}
              onMouseDown={() => setIsSeeking(true)}
              onMouseUp={handleSeek}
              onTouchStart={() => setIsSeeking(true)}
              onTouchEnd={handleSeek}
            />
            <span>{formatTime(duration)}</span>
          </div>

          <div className="player-controls">
            <button onClick={previousTrack} className="control-button">
              <FaBackward />
            </button>
            <button onClick={togglePlay} className="control-button play-pause">
              {isPaused ? <FaPlay /> : <FaPause />}
            </button>
            <button onClick={nextTrack} className="control-button">
              <FaForward />
            </button>
          </div>

          <div className="device-controls">
            <button onClick={handleDeviceToggle} className="devices-button">
              {showDevices ? "Hide Devices" : "Show Devices"}
            </button>
            {showDevices && (
              <div className="devices-list">
                {availableDevices.length > 0 ? (
                  availableDevices.map((device) => (
                    <div
                      key={device.id}
                      className={`device-item ${
                        device.id === deviceId ? "active" : ""
                      }`}
                      onClick={() => transferToDevice(device.id)}
                    >
                      {device.name} ({device.type})
                      {device.id === deviceId && " (Current)"}
                    </div>
                  ))
                ) : (
                  <div className="no-devices">No devices available</div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SpotifyPlayer;
