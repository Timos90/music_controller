import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  LinearProgress,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";

const MusicPlayer = ({ title, artist, image_url, is_playing, time, duration }) => {
  const songProgress = (time / duration) * 100;

  const pauseSong = async () => {
    try {
      await fetch("/spotify/pause", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error pausing song:", error);
    }
  };

  const playSong = async () => {
    try {
      const response = await fetch("/spotify/play", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",  // Include session cookies
      });
  
      if (!response.ok) {
        throw new Error("Failed to play song");
      }
  
      // Update state if needed
      if (onPlayPause) onPlayPause();
    } catch (error) {
      console.error("Error playing song:", error);
    }
  };

  return (
    <Card sx={{ display: "flex", alignItems: "center", padding: 2 }}>
      <CardMedia
        component="img"
        sx={{ width: 100, height: 100, objectFit: "cover", marginRight: 2 }}
        image={image_url}
        alt={`${title} album cover`}
      />
      <Box sx={{ flex: 1 }}>
        <CardContent>
          <Typography component="h5" variant="h5">
            {title}
          </Typography>
          <Typography color="textSecondary" variant="subtitle1">
            {artist}
          </Typography>
        </CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={() => {
              is_playing ? pauseSong() : playSong();
            }}
          >
            {is_playing ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <IconButton>
            <SkipNextIcon />
          </IconButton>
        </Box>
        <LinearProgress
          variant="determinate"
          value={songProgress}
          sx={{ marginTop: 1 }}
        />
      </Box>
    </Card>
  );
};

export default MusicPlayer;
