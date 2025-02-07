// src/HomePage.js
import React, { useEffect, Suspense } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setRoom } from "../store/reducers/roomReducer";
import { Box, Button, ButtonGroup, Typography } from "@mui/material";
import { Routes, Route, Link } from "react-router-dom";

// Lazy load components
const RoomJoinPage = React.lazy(() => import("./RoomJoinPage"));
const CreateRoomPage = React.lazy(() => import("./CreateRoomPage"));
const Info = React.lazy(() => import("./Info"));
const Room = React.lazy(() => import("./Room"));

const HomePage = () => {
  const dispatch = useDispatch();
  const roomCode = useSelector((state) => state.room.roomCode); // Access roomCode from Redux
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserRoom = async () => {
      try {
        const response = await fetch("/api/user-in-room");
        const data = await response.json();
        if (data.code && location.pathname === "/") {
          // Dispatch the room data to the Redux store
          dispatch(setRoom({
            roomCode: data.code,
            votesToSkip: data.votes_to_skip,
            guestCanPause: data.guest_can_pause,
          }));
          navigate(`/room/${data.code}`);
        }
      } catch (error) {
        console.error("Error fetching room data:", error);
      }
    };

    fetchUserRoom();
  }, [dispatch, navigate, location.pathname]);

  const leaveRoomCallback = () => {
    dispatch(setRoom({ roomCode: null, votesToSkip: 2, guestCanPause: true }));
  };

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
    <Suspense fallback={<div>Loading...</div>}> {/* Show loading indicator until components are loaded */}
      <Routes>
        <Route path="/" element={roomCode ? <Navigate to={`room/${roomCode}`} /> : renderHomePage()} />
        <Route path="/join" element={<RoomJoinPage />} />
        <Route path="/info" element={<Info />} />
        <Route path="/create" element={<CreateRoomPage />} />
        <Route path="/room/:roomCode" element={<Room leaveRoomCallback={leaveRoomCallback} />} />
      </Routes>
    </Suspense>
  );
};

export default HomePage;
