import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const Room = () => {
  const { roomCode } = useParams(); // Get roomCode from URL
  const [votesToSkip, setVotesToSkip] = useState(2);
  const [guestCanPause, setGuestCanPause] = useState(false);
  const [isHost, setIsHost] = useState(false);

  // Fetch room details when component mounts
  useEffect(() => {
    const getRoomDetails = async () => {
      const response = await fetch(`/api/get-room?code=${roomCode}`);
      const data = await response.json();
      setVotesToSkip(data.votes_to_skip);
      setGuestCanPause(data.guest_can_pause);
      setIsHost(data.is_host);
    };

    getRoomDetails();
  }, [roomCode]); // Dependency array ensures useEffect runs when roomCode changes

  return (
    <div>
      <h3>Room Code: {roomCode}</h3>
      <p>Votes to Skip: {votesToSkip}</p>
      <p>Guest Can Pause: {guestCanPause ? "Yes" : "No"}</p>
      <p>Is Host: {isHost ? "Yes" : "No"}</p>
    </div>
  );
};

export default Room;
