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
          <IconButton>
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
