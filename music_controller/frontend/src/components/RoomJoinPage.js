import React, { useState } from "react";
import { TextField, Button, Typography, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

const RoomJoinPage = () => {
  const [roomCode, setRoomCode] = useState(""); // Replaces this.state.roomCode
  const [error, setError] = useState(""); // Replaces this.state.error
  const navigate = useNavigate(); // Replaces this.props.history.push()

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
        navigate(`/room/${roomCode}`); // Redirect to room page
      } else {
        setError("Room not found.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Typography variant="h4" component="h4" marginBottom={3}>
        Join a Room
      </Typography>
      <TextField
        error={!!error} // Converts string to boolean (true if error exists)
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
