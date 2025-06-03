// import React, { useEffect } from "react";

// const CLIENT_ID = "30b88ecb63a649a7af80b9cd401e4ff5";
// const REDIRECT_URI = "http://localhost:5173/";
// const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
// const RESPONSE_TYPE = "token";
// const SCOPES = [
//   "streaming",
//   "user-read-email",
//   "user-read-private",
//   "user-read-playback-state",
//   "user-modify-playback-state",
// ].join(" ");

// const SpotifyAuth = ({ onLoginSuccess }) => {
//   useEffect(() => {
//     const hash = window.location.hash;
//     if (hash) {
//       const token = hash
//         .substring(1)
//         .split("&")
//         .find((elem) => elem.startsWith("access_token"))
//         .split("=")[1];
//       if (token) {
//         onLoginSuccess(token);
//       }
//     }
//   }, [onLoginSuccess]);

//   const handleLogin = () => {
//     window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
//       REDIRECT_URI
//     )}&response_type=${RESPONSE_TYPE}&scope=${encodeURIComponent(SCOPES)}`;
//   };

//   return (
//     <div className="auth-container">
//       <button onClick={handleLogin} className="login-button">
//         Login with Spotify
//       </button>
//     </div>
//   );
// };

// export default SpotifyAuth;
