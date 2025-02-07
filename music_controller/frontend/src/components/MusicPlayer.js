import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  LinearProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";

const MusicPlayer = ({
  title,
  artist,
  image_url,
  is_playing,
  time,
  duration,
  votes,
  votes_required,
  onPlayPause,
  onSkip,
}) => {
  const songProgress = (time / duration) * 100;
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [open, setOpen] = useState(false);

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setOpen(true);
  };

  const skipSong = async () => {
    try {
      const response = await fetch("/spotify/skip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        showMessage(data.error || "Failed to skip song.", "error");
      } else {
        showMessage(data.message || "Song skipped successfully!", "success");
        if (onSkip) onSkip();
      }
    } catch (error) {
      console.error("Error skipping song:", error);
      showMessage("An error occurred.", "error");
    }
  };

  const pauseSong = async () => {
  // Optimistically update the pause state before making the API call
  if (onPlayPause) onPlayPause(false);

  try {
    const response = await fetch("/spotify/pause", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });

    // Check if the response was successful
    if (!response.ok) {
      throw new Error("Failed to pause song.");
    }

    showMessage("Song paused!", "info");
  } catch (error) {
    console.error("Error pausing song:", error);
    showMessage("Failed to pause song.", "error");

    // Revert the state if the fetch fails
    if (onPlayPause) onPlayPause(true);
  }
};

  const playSong = async () => {
    // Optimistically update the play state before making the API call
    if (onPlayPause) onPlayPause(true);
  
    try {
      const response = await fetch("/spotify/play", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
  
      // Check if the response was successful
      if (!response.ok) {
        throw new Error("Failed to play song.");
      }
  
      showMessage("Song playing!", "info");
    } catch (error) {
      console.error("Error playing song:", error);
      showMessage("Failed to play song.", "error");
  
      // Revert the state if the fetch fails
      if (onPlayPause) onPlayPause(false);
    }
  };

  return (
    <Card
      sx={{
        display: "flex",
        alignItems: "center",
        padding: 2,
        gap: 2,
        maxWidth: 600,
        margin: "auto",
      }}
    >
      <CardMedia
        component="img"
        sx={{ width: 100, height: 100, objectFit: "cover", borderRadius: 1 }}
        image={image_url}
        alt={`${title} album cover`}
      />
      <Box sx={{ flex: 1 }}>
        <CardContent sx={{ padding: 0 }}>
          <Typography component="h5" variant="h5">
            {title}
          </Typography>
          <Typography color="text.secondary" variant="subtitle1">
            {artist}
          </Typography>
        </CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            marginTop: 1,
          }}
        >
          <IconButton
            onClick={() => {
              is_playing ? pauseSong() : playSong();
            }}
          >
            {is_playing ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <IconButton onClick={skipSong}>
            <Typography variant="subtitle2" color="text.secondary">
              {votes} / {votes_required}
            </Typography>
            <SkipNextIcon />
          </IconButton>
        </Box>
        <LinearProgress
          variant="determinate"
          value={songProgress}
          sx={{ marginTop: 1 }}
        />
      </Box>

      {/* Snackbar for messages */}
      <Snackbar open={open} autoHideDuration={3000} onClose={() => setOpen(false)}>
        <Alert severity={messageType} onClose={() => setOpen(false)}>
          {message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

MusicPlayer.propTypes = {
  title: PropTypes.string.isRequired,
  artist: PropTypes.string.isRequired,
  image_url: PropTypes.string.isRequired,
  is_playing: PropTypes.bool.isRequired,
  time: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
  votes: PropTypes.number.isRequired,
  votes_required: PropTypes.number.isRequired,
  onPlayPause: PropTypes.func,
  onSkip: PropTypes.func,
};

export default MusicPlayer;
