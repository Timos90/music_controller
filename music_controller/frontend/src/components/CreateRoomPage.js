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
  Alert,
  Collapse,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

const CreateRoomPage = ({
  update = false,
  votesToSkip = 2,
  guestCanPause = true,
  roomCode = null,
  updateCallback = () => {},
}) => {
  const navigate = useNavigate();
  const [guestControl, setGuestControl] = useState(guestCanPause);
  const [votes, setVotes] = useState(votesToSkip);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleVotesChange = (e) => setVotes(Number(e.target.value));
  const handleGuestControlChange = (e) => setGuestControl(e.target.value === "true");

  const handleRoomButtonPressed = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        votes_to_skip: votes,
        guest_can_pause: guestControl,
      }),
    };

    fetch("/api/create-room", requestOptions)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        navigate(`/room/${data.code}`);
      });
  };

  const handleUpdateButtonPressed = () => {
    const requestOptions = {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        votes_to_skip: votes,
        guest_can_pause: guestControl,
        code: roomCode,
      }),
    };

    fetch("/api/update-room", requestOptions).then((response) => {
      if (response.ok) {
        setSuccessMsg("Room updated successfully!");
        updateCallback(); // Notify parent that update is done
      } else {
        setErrorMsg("Error updating room...");
      }
    });
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      padding={3}
    >
      <Collapse in={errorMsg || successMsg}>
        {successMsg ? (
          <Alert
            severity="success"
            onClose={() => setSuccessMsg("")}
            sx={{ marginBottom: 2 }}
          >
            {successMsg}
          </Alert>
        ) : (
          <Alert
            severity="error"
            onClose={() => setErrorMsg("")}
            sx={{ marginBottom: 2 }}
          >
            {errorMsg}
          </Alert>
        )}
      </Collapse>
      <Typography component="h4" variant="h4" marginBottom={2}>
        {update ? "Update Room" : "Create A Room"}
      </Typography>
      <FormControl component="fieldset" margin="normal">
        <FormHelperText>
          <div align="center">Guest Control of Playback State</div>
        </FormHelperText>
        <RadioGroup
          row
          value={guestControl.toString()}
          onChange={handleGuestControlChange}
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
          value={votes}
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
        {update ? (
          <>
            <Button
              color="primary"
              variant="contained"
              onClick={handleUpdateButtonPressed}
              sx={{ marginRight: 2 }}
            >
              Update Room
            </Button>
          </>
        ) : (
          <>
            <Button
              color="primary"
              variant="contained"
              onClick={handleRoomButtonPressed}
              sx={{ marginRight: 2 }}
            >
              Create A Room
            </Button>
            <Button
              color="secondary"
              variant="contained"
              component={Link}
              to="/"
            >
              Back
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default CreateRoomPage;
