import React, { useState, useEffect, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, Typography, Card, CardContent } from "@mui/material";
import ChatRoom from './ChatRoom';

// Lazy load the MusicPlayer component
const MusicPlayer = React.lazy(() => import("./MusicPlayer"));
const CreateRoomPage = React.lazy(() => import("./CreateRoomPage"));

const Room = ({ leaveRoomCallback, username }) => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [votesToSkip, setVotesToSkip] = useState(2);
  const [guestCanPause, setGuestCanPause] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [spotifyAuthenticated, setSpotifyAuthenticated] = useState(false);
  const [song, setSong] = useState({});

  // Fetch room details
  const getRoomDetails = async () => {
    try {
      const response = await fetch(`/api/get-room?code=${roomCode}`);
      if (!response.ok) {
        leaveRoomCallback();
        navigate("/");
        return;
      }
      const data = await response.json();
      setVotesToSkip(data.votes_to_skip);
      setGuestCanPause(data.guest_can_pause);
      setIsHost(data.is_host);
      if (data.is_host) {
        authenticateSpotify();
      }
    } catch (error) {
      console.error("Failed to fetch room details:", error);
    }
  };

  // Spotify authentication
  const authenticateSpotify = async () => {
    try {
      const response = await fetch("/spotify/is-authenticated");
      const data = await response.json();
      setSpotifyAuthenticated(data.status);
      if (!data.status) {
        const authResponse = await fetch("/spotify/get-auth-url");
        const authData = await authResponse.json();
        window.location.replace(authData.url);
      }
    } catch (error) {
      console.error("Spotify authentication failed:", error);
    }
  };

  // Fetch current song
  const getCurrentSong = async () => {
    try {
      const response = await fetch("/spotify/current-song");

      if (response.status === 204) {
        console.log("No song is currently playing.");
        return;  // Exit early if no content is returned
      }
      
      if (response.status === 401) {
        console.error("User is not authenticated. Redirecting to Spotify login.");
        // Redirect user to Spotify authentication if needed
        window.location.href = "/spotify/get-auth-url";
        return;
      }
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      setSong(data);
      console.log("Current song data:", data);
    } catch (error) {
      console.error("Failed to fetch current song:", error);
    }
  };

  useEffect(() => {
    getRoomDetails();
    const songInterval = setInterval(getCurrentSong, 1000);
    return () => clearInterval(songInterval); // Cleanup interval on component unmount
  }, [roomCode, navigate, leaveRoomCallback]);

  // Leave room
  const leaveButtonPressed = async () => {
    try {
      await fetch("/api/leave-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      leaveRoomCallback();
      navigate("/");
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  };

  // Render settings
  const renderSettings = () => (
    <Box display="flex" flexDirection="column" alignItems="center" padding={3}>
      <CreateRoomPage
        update
        votesToSkip={votesToSkip}
        guestCanPause={guestCanPause}
        roomCode={roomCode}
        updateCallback={getRoomDetails}
      />
      <Button
        variant="contained"
        color="secondary"
        sx={{ marginTop: 2 }}
        onClick={() => setShowSettings(false)}
      >
        Close
      </Button>
    </Box>
  );

  return (
    <Box display="flex" flexDirection="column" alignItems="center" padding={3}>
      {showSettings ? (
        renderSettings()
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            Room Code: {roomCode}
          </Typography>
          {/* Lazy load MusicPlayer */}
          <Suspense fallback={<div>Loading Music Player...</div>}>
            <MusicPlayer {...song} />
          </Suspense>

          {isHost && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowSettings(true)}
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

          {/* ChatRoom styled in a box */}
          <Card sx={{ marginTop: 3, width: '100%', maxWidth: 500, padding: 2 }}>
            <CardContent>
              <ChatRoom roomCode={roomCode} username={username} />
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default Room;
