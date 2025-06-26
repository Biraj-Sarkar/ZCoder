import React, { useEffect, useState } from "react";
import logo from "../assets/zcoder-logo.png";
import "../styles/room-styles.css";
import { useNavigate } from "react-router-dom";

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
];

const HomePage = () => {
  const [username, setUsername] = useState("User");
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [rooms, setRooms] = useState([]); // State to store rooms
  const [error, setError] = useState(""); // State for error messages

  // Create Room form state
  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [roomLanguage, setRoomLanguage] = useState("javascript");
  const [privacy, setPrivacy] = useState("public");

  // Join Room form state
  const [joinRoomId, setJoinRoomId] = useState("");
  const [joinPassword, setJoinPassword] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch rooms and username on component mount
    const fetchRooms = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/rooms");
        if (!res.ok) {
          throw new Error("Failed to fetch rooms");
        }
        const data = await res.json();
        setRooms(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to fetch rooms"); // Use setError for error display
      }
    };
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      // Redirect to login if no username
      navigate("/login");
    }
    fetchRooms();
  }, [navigate]);

  // Interactive effects for cards
  useEffect(() => {
    const cards = document.querySelectorAll(".room-card");
    cards.forEach((card) => {
      card.addEventListener("mouseenter", function () {
        this.style.transform = "translateY(-8px) scale(1.02)";
      });
      card.addEventListener("mouseleave", function () {
        this.style.transform = "translateY(0) scale(1)";
      });
    });
    const inputs = document.querySelectorAll("input, select");
    inputs.forEach((input) => {
      input.addEventListener("focus", function () {
        this.parentElement.style.transform = "translateY(-2px)";
      });
      input.addEventListener("blur", function () {
        this.parentElement.style.transform = "translateY(0)";
      });
    });
    return () => {
      cards.forEach((card) => {
        card.removeEventListener("mouseenter", null);
        card.removeEventListener("mouseleave", null);
      });
      inputs.forEach((input) => {
        input.removeEventListener("focus", null);
        input.removeEventListener("blur", null);
      });
    };
  }, [showCreate, showJoin]);

  const handleShowCreate = () => {
    setShowCreate(true);
    setShowJoin(false);
  };

  const handleShowJoin = () => {
    setShowJoin(true);
    setShowCreate(false);
  };

  const handleHideForms = () => {
    setShowCreate(false);
    setShowJoin(false);
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) {
      setError("Please enter a room name"); // Use setError for error display
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: roomName,
          description: roomDescription,
          language: roomLanguage,
          privacy: privacy,
          creator: username,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create room");
      }

      const data = await res.json();
      alert(
        `Room "${roomName}" created successfully!\nRoom ID: ${data.room._id}\nCreator: ${username}\n\nYou can share this ID with others to invite them.`
      );
      setTimeout(() => {
        navigate(
          `/coding?roomId=${data.room._id}&username=${encodeURIComponent(
            username
          )}&roomName=${encodeURIComponent(data.room.name)}`
        );
      }, 1500);
      handleHideForms();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create room"); // Use setError for error display
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!joinRoomId.trim()) {
      setError("Please enter a room ID");
      return;
    }

    try {
      console.log(`Joining room with ID: ${joinRoomId}`); // Debug log
      const res = await fetch(
        `http://localhost:5001/api/rooms/join/${joinRoomId}`,
        {
          method: "GET",
        }
      );

      if (!res.ok) {
        const errorData = await res.json(); // Parse error response
        console.error("Error joining room:", errorData); // Debug log
        throw new Error(errorData.message || "Invalid room ID");
      }

      const data = await res.json(); // Parse successful response
      console.log("Room data received:", data); // Debug log
      alert(
        `Joining room: ${joinRoomId.toUpperCase()}\nUsername: ${username}\n\nConnecting to the coding room...`
      );

      navigate(
        `/coding?roomId=${data.room._id}&username=${encodeURIComponent(
          username
        )}&roomName=${encodeURIComponent(data.room.name)}`
      );
      handleHideForms();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to join room");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      alert("Logged out successfully!");
      localStorage.removeItem("username");
      navigate("/login");
    }
  };

  return (
    <div className="room-container">
      <div className="room-user-info">
        <div className="room-welcome-text">
          Welcome back, <span id="current-username">{username}</span>!
        </div>
        <button className="room-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="room-logo-section">
        <img src={logo} alt="ZCoder Logo" className="room-logo" />
        <h1 className="room-brand-title">ZCODER</h1>
        <p className="room-brand-subtitle">Collaborate • Code • Conquer</p>
      </div>

      <div className="room-description-section">
        <h2 className="room-description-title">Welcome to ZCoder</h2>
        <p className="room-description-text">
          ZCoder is a collaborative coding platform where developers unite to
          create, learn, and innovate together. Join coding rooms, work on
          projects in real-time, share knowledge, and build amazing software
          with fellow developers from around the world. Whether you're a
          beginner looking to learn or an expert ready to mentor, ZCoder
          provides the perfect environment for collaborative programming.
        </p>
        <div className="room-features-grid">
          <div className="room-feature-card">
            <div className="room-feature-icon">🚀</div>
            <h3 className="room-feature-title">Real-time Collaboration</h3>
            <p className="room-feature-desc">
              Code together with multiple developers in real-time with live
              cursor tracking and instant synchronization.
            </p>
          </div>
          <div className="room-feature-card">
            <div className="room-feature-icon">💡</div>
            <h3 className="room-feature-title">Smart Code Editor</h3>
            <p className="room-feature-desc">
              Advanced code editor with syntax highlighting, auto-completion,
              and intelligent suggestions.
            </p>
          </div>
          <div className="room-feature-card">
            <div className="room-feature-icon">🌐</div>
            <h3 className="room-feature-title">Multi-language Support</h3>
            <p className="room-feature-desc">
              Support for 50+ programming languages including Python,
              JavaScript, Java, C++, and more.
            </p>
          </div>
          <div className="room-feature-card">
            <div className="room-feature-icon">🔒</div>
            <h3 className="room-feature-title">Secure Rooms</h3>
            <p className="room-feature-desc">
              Private and public rooms with customizable permissions and secure
              code sharing.
            </p>
          </div>
        </div>
      </div>

      <div className="room-section">
        <h2 className="room-title">Get Started with Coding Rooms</h2>
        <div className="room-username-display">
          Coding as: <strong id="display-username">{username}</strong>
        </div>
        {error && (
          <div className="error-message">{error}</div> // Display error message
        )}
        <div className="room-options">
          <div className="room-card" onClick={handleShowCreate}>
            <div className="room-card-icon">➕</div>
            <h3>Create Room</h3>
            <p>
              Start a new coding session and invite others to collaborate on
              your project. Set up your workspace with custom settings and
              privacy options.
            </p>
          </div>
          <div className="room-card" onClick={handleShowJoin}>
            <div className="room-card-icon">🚪</div>
            <h3>Join Room</h3>
            <p>
              Enter an existing coding room using a room ID or invitation link.
              Jump into ongoing projects and start collaborating immediately.
            </p>
          </div>
        </div>

        {/* Create Room Form */}
        {showCreate && (
          <form
            id="create-room-form"
            className="room-form room-active"
            onSubmit={handleCreateRoom}
          >
            <h3 style={{ marginBottom: 20, color: "#333" }}>Create New Room</h3>
            <div className="room-form-group">
              <label htmlFor="room-name">Room Name</label>
              <input
                type="text"
                id="room-name"
                placeholder="Enter room name (e.g., 'Python Study Group')"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
            </div>
            <div className="room-form-group">
              <label htmlFor="room-description">Description (Optional)</label>
              <input
                type="text"
                id="room-description"
                placeholder="Brief description of the room purpose"
                value={roomDescription}
                onChange={(e) => setRoomDescription(e.target.value)}
              />
            </div>
            <div className="room-form-group">
              <label htmlFor="room-language">Primary Language</label>
              <select
                id="room-language"
                value={roomLanguage}
                onChange={(e) => setRoomLanguage(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e1e1e1",
                  borderRadius: "10px",
                  fontSize: "16px",
                  backgroundColor: "white",
                }}
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="room-form-group">
              <label>Room Privacy</label>
              <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontWeight: "normal",
                  }}
                >
                  <input
                    type="radio"
                    name="privacy"
                    value="public"
                    checked={privacy === "public"}
                    onChange={() => setPrivacy("public")}
                  />
                  Public (Anyone can join)
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontWeight: "normal",
                  }}
                >
                  <input
                    type="radio"
                    name="privacy"
                    value="private"
                    checked={privacy === "private"}
                    onChange={() => setPrivacy("private")}
                  />
                  Private (Invite only)
                </label>
              </div>
            </div>
            <div className="room-form-actions">
              <button className="room-btn btn-primary" type="submit">
                Create Room
              </button>
              <button
                className="room-btn btn-secondary"
                type="button"
                onClick={handleHideForms}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Join Room Form */}
        {showJoin && (
          <form
            id="join-room-form"
            className="room-form room-active"
            onSubmit={handleJoinRoom}
          >
            <h3 style={{ marginBottom: 20, color: "#333" }}>
              Join Existing Room
            </h3>
            <div className="room-form-group">
              <label htmlFor="room-id">Room ID or Invitation Code</label>
              <input
                type="text"
                id="room-id"
                placeholder="Enter room ID (e.g., 'ABC123' or invitation link)"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
              />
            </div>
            <div className="room-form-group">
              <label htmlFor="join-password">Room Password (if required)</label>
              <input
                type="password"
                id="join-password"
                placeholder="Enter room password if private"
                value={joinPassword}
                onChange={(e) => setJoinPassword(e.target.value)}
              />
            </div>
            <div className="room-form-actions">
              <button className="room-btn btn-primary" type="submit">
                Join Room
              </button>
              <button
                className="room-btn btn-secondary"
                type="button"
                onClick={handleHideForms}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Room List Display */}
        {rooms.length > 0 && (
          <div className="room-list">
            <h3>Available Rooms</h3>
            <ul className="room-list-ul">
              {rooms.map((room) => (
                <li key={room._id} className="room-list-li">
                  <span className="room-name">{room.name}</span>
                  <span className="room-description">{room.description}</span>
                  <button
                    className="room-join-button"
                    onClick={() => {
                      navigate(
                        `/coding?roomId=${
                          room._id
                        }&username=${encodeURIComponent(
                          username
                        )}&roomName=${encodeURIComponent(room.name)}`
                      );
                    }}
                  >
                    Join
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
