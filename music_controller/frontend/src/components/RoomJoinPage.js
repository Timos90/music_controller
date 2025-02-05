// src/RoomJoinPage.js
import React, { useState } from "react";
import { TextField, Button, Typography, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setRoom } from '../store/reducers/roomReducer';

const RoomJoinPage = () => {
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleTextFieldChange = (e) => {
    setRoomCode(e.target.value);
  };

  const roomButtonPressed = async () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: roomCode,
      }),
    };

    try {
      const response = await fetch("/api/join-room", requestOptions);
      if (response.ok) {
        // Dispatch the room data to Redux after joining
        const data = await response.json();
        dispatch(setRoom({
          roomCode: data.code,
          votesToSkip: data.votes_to_skip,
          guestCanPause: data.guest_can_pause,
        }));
        navigate(`/room/${data.code}`); // Redirect to the room
      } else {
        setError("Room not found.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred while joining the room.");
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
      <Typography variant="h4" component="h4" marginBottom={3}>
        Join a Room
      </Typography>
      <TextField
        error={!!error}
        label="Code"
        placeholder="Enter a Room Code"
        value={roomCode}
        helperText={error}
        variant="outlined"
        onChange={handleTextFieldChange}
        fullWidth
        sx={{ maxWidth: "400px", marginBottom: 2 }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={roomButtonPressed}
        sx={{ width: "200px", marginBottom: 2 }}
      >
        Enter Room
      </Button>
      <Button
        variant="contained"
        color="secondary"
        component={Link}
        to="/"
        sx={{ width: "200px" }}
      >
        Back
      </Button>
    </Box>
  );
};

export default RoomJoinPage;
