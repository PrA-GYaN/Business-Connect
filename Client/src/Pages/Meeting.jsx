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

  const socketId = onlineUsers[id];

  useEffect(() => {
    if (stream && myVideo.current) {
      myVideo.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    setMe(socket.id);
  }, [socket]);

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

  const {
    receivingCall,
    callAccepted,
    callEnded,
    caller,
    userVideo,
    connectionRef,
    callUser,
    answerCall,
    leaveCall,
    idToCall,
    stopCalling,  // Get stopCalling function
  } = useCall(socketId, stream, me, fullName);

  useEffect(() => {
    if (socketId && !callAccepted) {
      stopCalling(socketId);  // Ensure the calling user stops calling if the call is accepted
    }
  }, [callAccepted, socketId, stopCalling]);

  return (
    <>
      <h1 style={{ textAlign: "center", color: "#fff" }}>Zoomish</h1>
      <div className="container">
        <div className="video-container">
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
          <div className="video">
            {callAccepted && !callEnded ? (
              <video
                playsInline
                ref={userVideo}
                autoPlay
                style={{ width: "300px", border: "1px solid #fff" }}
              />
            ) : (
              <p>Waiting for user...</p>
            )}
          </div>
        </div>
        <div className="myId">
          <div className="call-button">
            {callAccepted && !callEnded ? (
              <button onClick={leaveCall}>End Call</button>
            ) : (
              <button onClick={() => callUser(idToCall)}>Call</button>
            )}
            {idToCall}
          </div>
        </div>
        {receivingCall && !callAccepted && (
          <div className="caller">
            <h1>{caller} is calling...</h1>
            <button onClick={answerCall}>Answer</button>
          </div>
        )}
      </div>
    </>
  );
}

export default Meeting;