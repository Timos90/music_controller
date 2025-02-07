import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, List, ListItem } from '@mui/material';

const ChatRoom = ({ roomCode }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");  // Ensure username starts as an empty string
  const [isNameSet, setIsNameSet] = useState(false);  // Track if username is set

  // Fetch messages every 2 seconds
  useEffect(() => {
    const fetchMessages = async () => {
      const response = await fetch(`/api/chat/${roomCode}/receive/`);
      const data = await response.json();
      setMessages(data);
    };

    fetchMessages();
    const intervalId = setInterval(fetchMessages, 2000); // Poll every 2 seconds

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [roomCode]);

  const handleSendMessage = async () => {
    if (!username) {
      alert("Please enter your username before sending a message.");
      return;
    }

    const requestBody = {
      room_code: roomCode,
      user: username,
      message: message,
    };

    const response = await fetch(`/api/chat/${roomCode}/send/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      setMessage("");  // Clear message input after sending
    } else {
      console.error("Error sending message");
    }
  };

  const handleSetUsername = () => {
    if (username.trim()) {
      setIsNameSet(true); // Set the name if it is not empty
    } else {
      alert("Please provide a valid name.");
    }
  };

  return (
    <Box>
      {/* If username is not set, show the input field */}
      {!isNameSet ? (
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography variant="h6">Enter Your Name</Typography>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            sx={{ maxWidth: "300px", marginBottom: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSetUsername}
            sx={{ width: "200px" }}
          >
            Set Username
          </Button>
        </Box>
      ) : (
        <>
          {/* Chat UI */}
            <Typography 
                variant="h6" 
                gutterBottom
                sx={{
                    fontWeight: 'bold',
                    textAlign: 'center',
                }}
            >
            Chat
            </Typography>

          {/* Box for the message list with scrolling */}
          <Box
            sx={{
              height: "300px",  // Set the height of the chat box
              overflow: "auto", // Allow scrolling
              border: "1px solid #ccc",  // Border around the messages box
              padding: "10px", // Padding around the messages
              marginBottom: "10px",
            }}
          >
            <List>
            {messages.map((msg, index) => (
                <ListItem key={index} sx={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 0 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <strong>{msg.user}: </strong> {msg.message}
                  </Box>
                  <Box sx={{ alignSelf: 'flex-start', fontSize: '0.8rem', color: 'gray' }}>
                    {new Date(msg.timestamp).toLocaleTimeString()} {/* Timestamp on the far right */}
                  </Box>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Message input with character limit */}
          <TextField
            label="Type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
            sx={{ marginBottom: 2 }}
            inputProps={{
              maxLength: 200,  // Limit input to 200 characters
            }}
          />
          <Typography variant="body2" color="textSecondary" align="right">
            {message.length}/200 characters
          </Typography> {/* Display character count */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendMessage}
            sx={{ width: "200px" }}
          >
            Send
          </Button>
        </>
      )}
    </Box>
  );
};

export default ChatRoom;
