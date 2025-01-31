import React, { useState, useEffect } from "react";
import { Grid2, Button, Typography, IconButton } from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Link } from "react-router-dom";

const pages = {
  JOIN: "join",
  CREATE: "create",
};

export default function Info() {
  const [page, setPage] = useState(pages.JOIN);

  useEffect(() => {
    console.log("Info component mounted");
    return () => console.log("Info component unmounted");
  }, []);

  const getPageContent = () => {
    if (page === pages.JOIN) {
      return (
        <>
          <Typography variant="body1" component="p">
            <strong>Joining a Room:</strong> Enter a <strong>room code</strong> to join an existing session. 
            Enjoy synchronized music playback and vote to skip songs.
          </Typography>
          <Typography variant="body2" component="p" color="textSecondary">
            Don't have a room code? Ask the host to share one with you!
          </Typography>
        </>
      );
    } else {
      return (
        <>
          <Typography variant="body1" component="p">
            <strong>Creating a Room:</strong> As the host, you can start a session and control the playback settings. 
            Decide how many votes are needed to skip songs and whether guests can pause music.
          </Typography>
          <Typography variant="body2" component="p" color="textSecondary">
            Share the room code with friends to let them join!
          </Typography>
        </>
      );
    }
  };

  return (
    <Grid2 container spacing={2} justifyContent="center" alignItems="center">
      {/* Title */}
      <Grid2 xs={12} textAlign="center">
        <Typography variant="h4" gutterBottom>
          What is House Party?
        </Typography>
      </Grid2>

      {/* Page Content */}
      <Grid2 xs={12} md={8} textAlign="center">
        {getPageContent()}
      </Grid2>

      {/* Navigation Buttons */}
      <Grid2 xs={12} textAlign="center">
        <IconButton onClick={() => setPage(page === pages.CREATE ? pages.JOIN : pages.CREATE)}>
          {page === pages.CREATE ? <NavigateBeforeIcon /> : <NavigateNextIcon />}
        </IconButton>
      </Grid2>

      {/* Back Button */}
      <Grid2 xs={12} textAlign="center">
        <Button variant="contained" color="secondary" component={Link} to="/">
          Back
        </Button>
      </Grid2>
    </Grid2>
  );
}
