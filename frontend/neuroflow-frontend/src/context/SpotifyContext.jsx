// import { createContext, useContext, useEffect, useState } from "react";
// import axios from "axios";
// import React from "react";

// const SpotifyContext = createContext();

// export const SpotifyProvider = ({ children }) => {
//   const [token, setToken] = useState(null);
//   const [deviceId, setDeviceId] = useState(null);
//   const [player, setPlayer] = useState(null);
//   const [isActive, setIsActive] = useState(false);
//   const [currentTrack, setCurrentTrack] = useState(null);

//   const login = () => {
//     window.location.href = "http://localhost:8000/api/spotify/login";
//   };

//   const handleCallback = async (code) => {
//     try {
//       const response = await axios.get(
//         `http://localhost:8000/api/spotify/callback?code=${code}`
//       );
//       setToken(response.data.access_token);
//       localStorage.setItem(
//         "spotify_refresh_token",
//         response.data.refresh_token
//       );
//       initializePlayer(response.data.access_token);
//     } catch (error) {
//       console.error("Spotify callback error:", error);
//     }
//   };

//   const initializePlayer = (accessToken) => {
//     if (!window.Spotify) {
//       const script = document.createElement("script");
//       script.src = "https://sdk.scdn.co/spotify-player.js";
//       script.async = true;
//       document.body.appendChild(script);
//     }
//     // Transfer playback if not already active
//     const transferPlayback = async () => {
//       try {
//         await fetch("https://api.spotify.com/v1/me/player", {
//           method: "PUT",
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             device_ids: [device_id],
//             play: true, // continue playing if a song is already playing
//           }),
//         });
//       } catch (err) {
//         console.error("Playback transfer failed:", err);
//       }
//     };

//     transferPlayback();

//     window.onSpotifyWebPlaybackSDKReady = () => {
//       const player = new window.Spotify.Player({
//         name: "Iris Dashboard",
//         getOAuthToken: (cb) => {
//           cb(accessToken);
//         },
//         volume: 0.5,
//       });

//       player.addListener("ready", ({ device_id }) => {
//         console.log("Ready with Device ID", device_id);
//         setDeviceId(device_id);
//         setIsActive(true);
//       });

//       player.addListener("not_ready", ({ device_id }) => {
//         console.log("Device offline", device_id);
//         setIsActive(false);
//       });

//       player.addListener("player_state_changed", (state) => {
//         if (!state) return;
//         setCurrentTrack(state.track_window.current_track);
//         setIsPaused(state.paused);
//       });

//       player.connect();
//       setPlayer(player);
//     };

//     document.body.appendChild(script);
//   };

//   useEffect(() => {
//     // Check for callback code in URL
//     const params = new URLSearchParams(window.location.search);
//     const code = params.get("code");
//     if (code) {
//       handleCallback(code);
//       // Clean the URL
//       window.history.replaceState({}, document.title, window.location.pathname);
//     }
//   }, []);

//   return (
//     <SpotifyContext.Provider
//       value={{
//         token,
//         deviceId,
//         player,
//         isActive,
//         currentTrack,
//         login,
//       }}
//     >
//       {children}
//     </SpotifyContext.Provider>
//   );
// };

// export const useSpotify = () => useContext(SpotifyContext);

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const SpotifyContext = createContext();

export const SpotifyProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [player, setPlayer] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPaused, setIsPaused] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [availableDevices, setAvailableDevices] = useState([]);

  // Initialize Spotify SDK and check for existing session
  useEffect(() => {
    // Load Spotify Web Playback SDK if not already loaded
    if (!window.Spotify) {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);
    }

    // Check for existing tokens
    const refreshToken = localStorage.getItem("spotify_refresh_token");
    const accessToken = localStorage.getItem("spotify_access_token");
    const savedDeviceId = localStorage.getItem("spotify_device_id");
    
    if (refreshToken && accessToken) {
      setToken(accessToken);
      if (savedDeviceId) {
        setDeviceId(savedDeviceId);
      }
    }

    // Check for authorization callback
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      handleCallback(code);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, []);

  // Initialize player when token changes
  useEffect(() => {
    if (token && !isInitialized) {
      initializePlayer();
      setIsInitialized(true);
    }
  }, [token]);

  const refreshAccessToken = async (refreshToken) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/spotify/refresh?refresh_token=${refreshToken}`
      );
      const { access_token, refresh_token } = response.data;
      setToken(access_token);
      localStorage.setItem("spotify_access_token", access_token);
      if (refresh_token) {
        localStorage.setItem("spotify_refresh_token", refresh_token);
      }
      return access_token;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      logout();
      return null;
    }
  };

  const login = () => {
    window.location.href = "http://localhost:8000/api/spotify/login";
  };

  const logout = () => {
    localStorage.removeItem("spotify_refresh_token");
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_device_id");
    if (player) {
      player.disconnect();
    }
    setToken(null);
    setPlayer(null);
    setIsActive(false);
    setIsInitialized(false);
    setDeviceId(null);
  };

  const handleCallback = async (code) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/spotify/callback?code=${code}`
      );
      const { access_token, refresh_token } = response.data;
      setToken(access_token);
      localStorage.setItem("spotify_refresh_token", refresh_token);
      localStorage.setItem("spotify_access_token", access_token);
    } catch (error) {
      console.error("Spotify callback error:", error);
    }
  };

  const initializePlayer = () => {
    // Wait for Spotify SDK to be ready
    if (!window.Spotify) {
      const interval = setInterval(() => {
        if (window.Spotify) {
          clearInterval(interval);
          createPlayer();
        }
      }, 100);
      return;
    }
    createPlayer();
  };

  const createPlayer = () => {
    const player = new window.Spotify.Player({
      name: "Iris Dashboard",
      getOAuthToken: async (cb) => {
        // Check if token is still valid (or refresh if needed)
        const currentToken = token;
        cb(currentToken);
      },
      volume: 0.5,
    });

    player.addListener("ready", ({ device_id }) => {
      console.log("Ready with Device ID", device_id);
      setDeviceId(device_id);
      localStorage.setItem("spotify_device_id", device_id);
      setIsActive(true);

      // Transfer playback immediately for faster response
      transferPlayback(device_id, true);
    });

    player.addListener("not_ready", ({ device_id }) => {
      console.log("Device offline", device_id);
      setIsActive(false);
    });

    player.addListener("player_state_changed", (state) => {
      if (!state) return;
      setCurrentTrack(state.track_window.current_track);
      setIsPaused(state.paused);
      setPosition(state.position);
      setDuration(state.duration);
    });

    player.addListener("authentication_error", async ({ message }) => {
      console.error("Authentication Error:", message);
      const refreshToken = localStorage.getItem("spotify_refresh_token");
      if (refreshToken) {
        const newToken = await refreshAccessToken(refreshToken);
        if (newToken) {
          player._options.getOAuthToken = (cb) => cb(newToken);
          player.connect();
        }
      } else {
        logout();
      }
    });

    player.connect().then((success) => {
      if (success) {
        console.log("Connected to Spotify player");
        setPlayer(player);
      }
    });
  };

  const transferPlayback = async (deviceId, forcePlay = false) => {
    try {
      const response = await fetch("https://api.spotify.com/v1/me/player", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play: forcePlay || !isPaused,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      console.error("Playback transfer failed:", err);
    }
  };

  const togglePlay = async () => {
    if (!player || !deviceId) return;

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/me/player/${isPaused ? "play" : "pause"}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            device_id: deviceId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setIsPaused(!isPaused);
    } catch (error) {
      console.error("Error toggling play/pause:", error);
    }
  };

  const nextTrack = async () => {
    if (!player || !deviceId) return;

    try {
      const response = await fetch(
        "https://api.spotify.com/v1/me/player/next",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            device_id: deviceId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error skipping to next track:", error);
    }
  };

  const previousTrack = async () => {
    if (!player || !deviceId) return;

    try {
      const response = await fetch(
        "https://api.spotify.com/v1/me/player/previous",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            device_id: deviceId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error going to previous track:", error);
    }
  };

  const seekToPosition = async (positionMs) => {
    if (!player || !deviceId) return;

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/me/player/seek?position_ms=${positionMs}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            device_id: deviceId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setPosition(positionMs);
    } catch (error) {
      console.error("Error seeking to position:", error);
    }
  };

  const fetchDevices = async () => {
    try {
      const res = await fetch("https://api.spotify.com/v1/me/player/devices", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setAvailableDevices(data.devices || []);
      return data.devices || [];
    } catch (err) {
      console.error("Error fetching devices", err);
      return [];
    }
  };

  const transferToDevice = async (id) => {
    try {
      await fetch("https://api.spotify.com/v1/me/player", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ device_ids: [id], play: !isPaused }),
      });
      setDeviceId(id);
      localStorage.setItem("spotify_device_id", id);
    } catch (err) {
      console.error("Error transferring playback", err);
    }
  };

  return (
    <SpotifyContext.Provider
      value={{
        token,
        deviceId,
        player,
        isActive,
        currentTrack,
        isPaused,
        position,
        duration,
        availableDevices,
        login,
        logout,
        togglePlay,
        nextTrack,
        previousTrack,
        seekToPosition,
        fetchDevices,
        transferToDevice,
      }}
    >
      {children}
    </SpotifyContext.Provider>
  );
};

export const useSpotify = () => useContext(SpotifyContext);