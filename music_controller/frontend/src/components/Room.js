import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import { Box, Button, Typography } from "@mui/material";

const Room = ({ leaveRoomCallback }) => {
  const { roomCode } = useParams(); // Get roomCode from URL params
  const navigate = useNavigate();   // useNavigate replaces history.push
  const [votesToSkip, setVotesToSkip] = useState(2);
  const [guestCanPause, setGuestCanPause] = useState(false);
  const [isHost, setIsHost] = useState(false);

  // Fetch room details when component mounts
  useEffect(() => {
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
      } catch (error) {
        console.error("Failed to fetch room details:", error);
      }
    };

    getRoomDetails();
  }, [roomCode, navigate, leaveRoomCallback]); // Re-run effect if roomCode changes

  // Handle leaving the room
  const leaveButtonPressed = async () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    try {
      await fetch("/api/leave-room", requestOptions);
      leaveRoomCallback();  // Call the callback to update parent component
      navigate("/");  // Redirect to home
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" padding={3}>
      <Typography variant="h4" gutterBottom>
        Room Code: {roomCode}
      </Typography>
      <Typography variant="h6">Votes to Skip: {votesToSkip}</Typography>
      <Typography variant="h6">Guest Can Pause: {guestCanPause ? "Yes" : "No"}</Typography>
      <Typography variant="h6">Is Host: {isHost ? "Yes" : "No"}</Typography>
      <Button
        variant="contained"
        color="secondary"
        onClick={leaveButtonPressed}
        sx={{ marginTop: 2 }}
      >
        Leave Room
      </Button>
    </Box>
  );
};

export default Room;
