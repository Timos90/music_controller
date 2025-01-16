import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import hooks for routing
import { Box, Button, Typography } from "@mui/material";
import CreateRoomPage from "./CreateRoomPage"; // Import CreateRoomPage component

const Room = ({ leaveRoomCallback }) => {
  const { roomCode } = useParams(); // Get roomCode from URL params
  const navigate = useNavigate();   // useNavigate replaces history.push
  const [votesToSkip, setVotesToSkip] = useState(2);
  const [guestCanPause, setGuestCanPause] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // Show/hide settings state
  const [spotifyAuthenticated, setSpotifyAuthenticated] = useState(false); // Track Spotify authentication

  // Function to fetch room details
  const getRoomDetails = async () => {
    try {
      const response = await fetch(`/api/get-room?code=${roomCode}`);
      if (!response.ok) {
        leaveRoomCallback();
        navigate("/");  // Redirect to home if room doesn't exist
      }
      const data = await response.json();
      setVotesToSkip(data.votes_to_skip);
      setGuestCanPause(data.guest_can_pause);
      setIsHost(data.is_host);
      setSpotifyAuthenticated(data.spotify_authenticated);
      if (data.is_host) {
        authenticateSpotify(); // Only authenticate Spotify if the user is the host
      }
    } catch (error) {
      console.error("Failed to fetch room details:", error);
    }
  };

  // Function to authenticate Spotify
  const authenticateSpotify = async () => {
    try {
      const response = await fetch("/spotify/is-authenticated");
      const data = await response.json();
      setSpotifyAuthenticated(data.status);
      if (!data.status) {
        const authResponse = await fetch("/spotify/get-auth-url");
        const authData = await authResponse.json();
        window.location.replace(authData.url); // Redirect to Spotify auth URL if not authenticated
      }
    } catch (error) {
      console.error("Spotify authentication failed:", error);
    }
  };

  // Fetch room details on component mount
  useEffect(() => {
    getRoomDetails();
  }, [roomCode, navigate, leaveRoomCallback]); // Dependency array for useEffect

  // Handle leaving the room
  const leaveButtonPressed = async () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    try {
      await fetch("/api/leave-room", requestOptions);
      leaveRoomCallback();  // Reset the room in parent component
      navigate("/");  // Redirect to home
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  };

  // Function to toggle settings view
  const updateShowSettings = (value) => {
    setShowSettings(value);
  };

  // Render settings view (using CreateRoomPage for room update)
  const renderSettings = () => (
    <Box display="flex" flexDirection="column" alignItems="center" padding={3}>
      <CreateRoomPage
        update={true}
        votesToSkip={votesToSkip}
        guestCanPause={guestCanPause}
        roomCode={roomCode}
        updateCallback={getRoomDetails} // Pass getRoomDetails as the callback to refresh room details
      />
      <Button
        variant="contained"
        color="secondary"
        sx={{ marginTop: 2 }}
        onClick={() => updateShowSettings(false)} // Close settings view
      >
        Close
      </Button>
    </Box>
  );

  return (
    <Box display="flex" flexDirection="column" alignItems="center" padding={3}>
      {showSettings ? (
        renderSettings() // Show settings if open
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            Room Code: {roomCode}
          </Typography>
          <Typography variant="h6">Votes to Skip: {votesToSkip}</Typography>
          <Typography variant="h6">
            Guest Can Pause: {guestCanPause ? "Yes" : "No"}
          </Typography>
          <Typography variant="h6">Is Host: {isHost ? "Yes" : "No"}</Typography>
          <Typography variant="h6">
            Spotify Authenticated: {spotifyAuthenticated ? "Yes" : "No"}
          </Typography>
          {isHost && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => updateShowSettings(true)}
              sx={{ marginTop: 2 }}
            >
              Settings
            </Button>
          )}
          <Button
            variant="contained"
            color="secondary"
            onClick={leaveButtonPressed}
            sx={{ marginTop: 2 }}
          >
            Leave Room
          </Button>
        </>
      )}
    </Box>
  );
};

export default Room;
