import React, { useEffect, useState, useRef } from "react";
import { useSocketContext } from "../Context/SocketContext";
import { useAuthContext } from "../Context/AuthContext";
import { useLocation } from "react-router-dom";
import useCall from "../Hooks/useCall";

function Meeting() {
  const location = useLocation();
  const { selectedConversationId } = location.state || {};
  const id = selectedConversationId;
  const { socket, onlineUsers } = useSocketContext();
  const { fullName } = useAuthContext();
  const [me, setMe] = useState("");
  const [stream, setStream] = useState();
  const myVideo = useRef(null);
  const remoteVideo = useRef(null); // Renamed userVideo to remoteVideo to avoid conflict

  const socketId = onlineUsers[id]; // This assumes onlineUsers is an object where the key is userId

  // Set the user's socket ID
  useEffect(() => {
    setMe(socket.id);
  }, [socket]);

  // Set up the local media stream (audio/video)
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
        alert("Please allow camera and microphone access.");
      });
  }, []);

  // Whenever the stream changes, update the myVideo element
  useEffect(() => {
    if (stream && myVideo.current) {
      myVideo.current.srcObject = stream;
    }
  }, [stream]);

  // Use the custom hook for managing call logic
  const {
    receivingCall,
    callAccepted,
    callEnded,
    caller,
    remoteVideoRef,
    connectionRef,
    callUser,
    answerCall,
    leaveCall,
    idToCall,
  } = useCall(socketId, stream, me, fullName);

  // Call the user when socketId is available
  useEffect(() => {
    if (socketId && !callAccepted) {
      callUser(socketId);
    }
  }, [callAccepted, socketId, callUser]);

  // Function to render call button based on call state
  const handleCallButton = () => {
    if (callAccepted && !callEnded) {
      return (
        <button onClick={leaveCall}>End Call</button>
      );
    } else if (receivingCall && !callAccepted) {
      return (
        <>
          <h1>{caller} is calling...</h1>
          <button onClick={answerCall}>Answer</button>
        </>
      );
    } else {
      return (
        <button onClick={() => callUser(socketId)}>Call</button>
      );
    }
  };

  return (
    <>
      <h1 style={{ textAlign: "center", color: "#fff" }}>Zoomish</h1>
      <div className="container">
        <div className="video-container">
          {/* My video */}
          <div className="video">
            {stream ? (
              <video
                playsInline
                muted
                ref={myVideo}
                autoPlay
                style={{ width: "300px", border: "1px solid #fff" }}
              />
            ) : (
              <p>Loading video...</p>
            )}
          </div>

          {/* Remote video */}
          <div className="video">
            {callAccepted && !callEnded ? (
              <video
                playsInline
                ref={remoteVideo}  // Referencing the renamed video element
                autoPlay
                style={{ width: "300px", border: "1px solid #fff" }}
              />
            ) : (
              <p>Waiting for user...</p>
            )}
          </div>
        </div>

        {/* Call control section */}
        <div className="myId">
          <div className="call-button">
            {handleCallButton()}
          </div>
        </div>
      </div>
    </>
  );
}

export default Meeting;