import React, { useState } from "react";
import {
  Button,
  Typography,
  TextField,
  FormHelperText,
  FormControl,
  Radio,
  RadioGroup,
  FormControlLabel,
  Box,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

const CreateRoomPage = () => {
  const navigate = useNavigate();
  const defaultVotes = 2;

  const [guestCanPause, setGuestCanPause] = useState(true);
  const [votesToSkip, setVotesToSkip] = useState(defaultVotes);

  const handleVotesChange = (e) => setVotesToSkip(Number(e.target.value));
  const handleGuestCanPauseChange = (e) => setGuestCanPause(e.target.value === "true");

  const handleRoomButtonPressed = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        votes_to_skip: votesToSkip,
        guest_can_pause: guestCanPause,
      }),
    };

    fetch("/api/create-room", requestOptions)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        navigate(`/room/${data.code}`);
      });
  };

  return (
    <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
    >
      <Typography component="h4" variant="h4" marginBottom={2}>
        Create A Room
      </Typography>
      <FormControl component="fieldset" margin="normal">
        <FormHelperText>
          <div align="center">Guest Control of Playback State</div>
        </FormHelperText>
        <RadioGroup
          row
          defaultValue="true"
          onChange={handleGuestCanPauseChange}
        >
          <FormControlLabel
            value="true"
            control={<Radio color="primary" />}
            label="Play/Pause"
            labelPlacement="bottom"
          />
          <FormControlLabel
            value="false"
            control={<Radio color="secondary" />}
            label="No Control"
            labelPlacement="bottom"
          />
        </RadioGroup>
      </FormControl>
      <FormControl margin="normal">
        <TextField
          required
          type="number"
          onChange={handleVotesChange}
          defaultValue={defaultVotes}
          inputProps={{
            min: 1,
            style: { textAlign: "center" },
          }}
        />
        <FormHelperText>
          <div align="center">Votes Required To Skip Song</div>
        </FormHelperText>
      </FormControl>
      <Box marginTop={3}>
        <Button
          color="primary"
          variant="contained"
          onClick={handleRoomButtonPressed}
          sx={{ marginRight: 2 }}
        >
          Create A Room
        </Button>
        <Button color="secondary" variant="contained" component={Link} to="/">
          Back
        </Button>
      </Box>
    </Box>
  );
};

export default CreateRoomPage;
