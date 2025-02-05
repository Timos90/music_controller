# 🎵 Music Controller

A **Django + React** web app that allows users to create rooms and control Spotify playback collaboratively. Users can join rooms, vote to skip songs, and manage playback settings.

---

## 🚀 Features

- 🎼 **Spotify Integration** - Play, pause, and skip songs using Spotify(premium).
- 🏠 **Room Management** - Create and join rooms with unique codes.
- 📊 **Vote-to-Skip System** - Users can vote to skip a song.
- ⚡ **Real-time Updates** - Fetch current song details dynamically.
- 🎨 **Material-UI** - Modern UI components for a smooth experience.
- 🌍 **Django REST API** - Serves the backend logic efficiently.

---

## 🛠️ Installation

### **1. Clone the Repository**

```sh
git clone https://github.com/yourusername/music-controller.git
cd music-controller
```

### **2. Set Up Virtual Environment**

```sh
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

### **3. Install Backend Dependencies**

```sh
pip install -r requirements.txt
```

### **4. Apply Database Migrations**

```sh
python manage.py migrate
```

### **5. Run Django Server**

```sh
python manage.py runserver
```

---

## 🖥️ Frontend Setup

### **1. Install Node.js Dependencies**

Navigate to the `frontend` directory and install dependencies:

```sh
cd frontend
npm install
```

### **2. Build and Watch Frontend with Webpack**

```sh
npm run dev
```

---

## 🎵 Spotify Integration

To integrate with **Spotify**, create a `.env` file in the root directory and add:

```ini
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://127.0.0.1:8000/spotify/redirect
```

---

## 🛠 API Endpoints

| Endpoint                    | Method | Description                    |
| --------------------------- | ------ | ------------------------------ |
| `/api/create-room`          | `POST` | Create a new room              |
| `/api/join-room`            | `POST` | Join an existing room          |
| `/api/user-in-room`         | `GET`  | Check if user is in a room     |
| `/api/leave-room`           | `POST` | Leave the current room         |
| `/api/get-room`             | `GET`  | Retrieve room details          |
| `/spotify/get-auth-url`     | `GET`  | Get Spotify authentication URL |
| `/spotify/is-authenticated` | `GET`  | Check if user is authenticated |
| `/spotify/current-song`     | `GET`  | Get current song details       |
| `/spotify/play`             | `PUT`  | Play current song              |
| `/spotify/pause`            | `PUT`  | Pause current song             |
| `/spotify/skip`             | `POST` | Vote to skip song              |

---

## 📸 Screenshots

&#x20;

---

## 📌 Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`.
3. Commit your changes: `git commit -m "Added new feature"`.
4. Push to the branch: `git push origin feature-name`.
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the **MIT License**.

---


Happy Coding! 🎶

