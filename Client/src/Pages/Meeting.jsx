import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client'; // Assuming you're using Socket.IO for signaling

const Meeting = () => {
  const [localStream, setLocalStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const socket = useRef(null); // Reference to socket instance

  // Create a reference for the video element (for local and remote display)
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    // Initialize the socket connection
    socket.current = io('http://localhost:5000');

    // Initialize local media stream (getUserMedia)
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error('Error accessing media devices.', err);
      });

    // Handle signaling events from the server
    socket.current.on('offer', handleOffer);
    socket.current.on('answer', handleAnswer);
    socket.current.on('ice-candidate', handleICECandidate);

    return () => {
      // Cleanup socket listeners when component unmounts
      socket.current.off('offer');
      socket.current.off('answer');
      socket.current.off('ice-candidate');
    };
  }, []);

  // Create PeerConnection
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection();

    // Add local tracks to the peer connection only if localStream exists
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle remote stream when it's added to the connection
    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate to the remote peer
        socket.current.emit('ice-candidate', event.candidate);
      }
    };

    return pc;
  };

  // Handle the offer from the remote peer
  const handleOffer = (offer) => {
    const pc = createPeerConnection();
    setPeerConnection(pc);

    // Set remote description (the offer from the other peer)
    pc.setRemoteDescription(new RTCSessionDescription(offer))
      .then(() => {
        // Create an answer and send it back to the remote peer
        return pc.createAnswer();
      })
      .then((answer) => {
        return pc.setLocalDescription(answer);
      })
      .then(() => {
        // Send the answer back to the remote peer
        socket.current.emit('answer', pc.localDescription);
      })
      .catch((error) => {
        console.error('Error handling offer: ', error);
      });
  };

  // Handle the answer from the remote peer
  const handleAnswer = (answer) => {
    console.log('Answer received');
    if (peerConnection) {
      peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
        .catch((error) => {
          console.error('Error setting remote description: ', error);
        });
    }
  };

  // Handle incoming ICE candidates
  const handleICECandidate = (candidate) => {
    if (peerConnection) {
      peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
        .catch((error) => {
          console.error('Error adding ICE candidate: ', error);
        });
    }
  };

  // Create and send the offer to start the connection
  const createOffer = () => {
    const pc = createPeerConnection();
    setPeerConnection(pc);

    pc.createOffer()
      .then((offer) => {
        return pc.setLocalDescription(offer);
      })
      .then(() => {
        // Send the offer to the remote peer
        socket.current.emit('offer', pc.localDescription);
      })
      .catch((error) => {
        console.error('Error creating offer: ', error);
      });
  };

  // Handle connection state
  useEffect(() => {
    if (peerConnection && peerConnection.iceConnectionState === 'connected') {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [peerConnection]);

  // UI for the meeting component
  return (
    <div>
      <h1>WebRTC Meeting</h1>

      <div>
        <video ref={localVideoRef} autoPlay muted width="300" />
        <video ref={remoteVideoRef} autoPlay width="300" />
      </div>

      <div>
        {!isConnected && <button onClick={createOffer}>Start Call</button>}
        {isConnected && <button onClick={() => peerConnection.close()}>End Call</button>}
      </div>
    </div>
  );
};

export default Meeting;