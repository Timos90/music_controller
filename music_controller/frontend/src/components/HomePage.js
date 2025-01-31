import React, { useState, useEffect } from "react";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import Room from "./Room";
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { Box, Button, ButtonGroup, Typography } from "@mui/material";
import Info from "./info";

const HomePage = () => {
  const [roomCode, setRoomCode] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();  // Get the current URL path

  useEffect(() => {
    const fetchUserRoom = async () => {
      try {
        const response = await fetch("/api/user-in-room");
        const data = await response.json();
        if (data.code && location.pathname === "/") {
          // Redirect to the room only if you're on the home page
          setRoomCode(data.code);
          navigate(`/room/${data.code}`);
        }
      } catch (error) {
        console.error("Error fetching room data:", error);
      }
    };

    fetchUserRoom();
  }, [navigate, location.pathname]);

  const leaveRoomCallback = () => {
    setRoomCode(null);
  }

  const renderHomePage = () => (
    <Box display="flex" flexDirection="column" alignItems="center" padding={3}>
      <Typography variant="h3" component="h1" marginBottom={3}>
        House Party
      </Typography>
      <ButtonGroup variant="contained" disableElevation>
        <Button color="primary" component={Link} to="/join">
          Join a Room
        </Button>
        <Button sx={{ backgroundColor: "gray", color: "white" }} component={Link} to="/info">
           Info
        </Button>
        <Button color="secondary" component={Link} to="/create">
          Create a Room
        </Button>
      </ButtonGroup>
    </Box>
  );

  return (
    <Routes>
      <Route path="/" element={roomCode ? <Navigate to={`room/${roomCode}`} /> : renderHomePage()} />
      <Route path="/join" element={<RoomJoinPage />} />
      <Route path="/info" element={<Info />} />
      <Route path="/create" element={<CreateRoomPage />} />
      <Route path="/room/:roomCode" element={<Room leaveRoomCallback={leaveRoomCallback} />} />
    </Routes>
  );
};

export default HomePage;
