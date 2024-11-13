import React, { useState, useEffect, useRef } from 'react';
import { useSocketContext } from '../Context/SocketContext';
import { useLocation } from 'react-router-dom';

const Meeting = () => {
  const { socket,onlineUsers } = useSocketContext();
  const location = useLocation();
    const { selectedConversationId } = location.state || {};
  const [isCallActive, setIsCallActive] = useState(false);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerId, setPeerId] = useState(onlineUsers[selectedConversationId]);
  const [connectionState, setConnectionState] = useState('disconnected'); // Track connection state
  const [isCalling, setIsCalling] = useState(false); // To track if the user is in the process of calling
  const [hasAnswered, setHasAnswered] = useState(false); // Track if the peer has answered the call
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null); // Ref for the remote video
  const peerRef = useRef(null);
  const localStreamRef = useRef(null); // To keep track of the local stream

  // setPeerId(onlineUsers[selectedConversation]);
  console.log('peerId:', peerId);

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        // Get local media stream (video + audio)
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream; // Store local stream reference
        localVideoRef.current.srcObject = stream; // Attach to local video element

        // Initialize peer connection
        peerRef.current = new RTCPeerConnection();

        // Add local tracks to peer connection
        stream.getTracks().forEach((track) => {
          peerRef.current.addTrack(track, stream);
        });

        peerRef.current.onicecandidate = handleICECandidateEvent;

        peerRef.current.ontrack = (event) => {
          // Handle remote stream
          if (event.streams && event.streams[0]) {
            setRemoteStream(event.streams[0]);

            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = event.streams[0];
              console.log('Remote video set.');
            } else {
              console.error('Remote video element not available.');
            }
          } else {
            console.error('No remote streams received in the ontrack event.');
          }
        };

        // Connection state change listener
        peerRef.current.oniceconnectionstatechange = () => {
          const iceConnectionState = peerRef.current.iceConnectionState;
          console.log('ICE Connection State Changed:', iceConnectionState);
          setConnectionState(iceConnectionState);

          // Handle unexpected disconnection
          if (iceConnectionState === 'failed') {
            console.error('ICE connection failed. Attempting to restart...');
            peerRef.current.restartIce(); // Attempt to restart ICE if connection fails
          }
        };

        // Peer connection state change listener
        peerRef.current.onconnectionstatechange = () => {
          const connectionState = peerRef.current.connectionState;
          console.log('Connection State Changed:', connectionState);
          setConnectionState(connectionState);
        };
      } catch (err) {
        console.error('Error accessing media devices: ', err);
      }
    };

    // Initialize media when component mounts
    if (socket) {
      socket.on('offer', handleOffer);
      socket.on('answer', handleAnswer);
      socket.on('ice-candidate', handleNewICECandidate);
    }

    // Initialize media stream
    initializeMedia();

    // Cleanup function
    return () => {
      if (localStreamRef.current) {
        const tracks = localStreamRef.current.getTracks();
        tracks.forEach(track => track.stop()); // Stop all tracks
      }

      if (peerRef.current) {
        peerRef.current.close(); // Close peer connection
      }

      if (socket) {
        socket.off('offer', handleOffer);
        socket.off('answer', handleAnswer);
        socket.off('ice-candidate', handleNewICECandidate);
      }
    };
  }, [socket]);

  const handleOffer = (offer, from) => {
    console.log('Offer received:', offer);
    peerRef.current.setRemoteDescription(new RTCSessionDescription(offer))
      .then(() => peerRef.current.createAnswer())
      .then((answer) => {
        return peerRef.current.setLocalDescription(answer);
      })
      .then(() => {
        console.log('Answer sent to server');
        socket.emit('answer', peerRef.current.localDescription, from);
        setHasAnswered(true); // Set state after answering the call
      })
      .catch((err) => {
        console.error('Error handling offer:', err);
      });
  };

  const handleAnswer = (answer) => {
    console.log('Answer received:', answer);
    peerRef.current.setRemoteDescription(new RTCSessionDescription(answer))
      .then(() => {
        console.log('Remote description set after answer');
        setHasAnswered(true); // Update state to reflect that the call has been answered
      })
      .catch((err) => {
        console.error('Error setting remote description after answer:', err);
      });
  };

  const handleICECandidateEvent = (event) => {
    if (event.candidate) {
      console.log('Sending ICE candidate:', event.candidate);
      socket.emit('ice-candidate', event.candidate, peerId);
    } else {
      console.log('All ICE candidates have been sent.');
    }
  };

  const handleNewICECandidate = (candidate) => {
    console.log('Received new ICE candidate:', candidate);
    peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
  };

  const handleCall = () => {
    if (!peerId) {
      alert('Please enter a valid peer ID');
      return;
    }

    setIsCalling(true);

    peerRef.current
      .createOffer()
      .then((offer) => peerRef.current.setLocalDescription(offer))
      .then(() => {
        socket.emit('offer', peerRef.current.localDescription, peerId);
        setIsCallActive(true);
      })
      .catch((err) => {
        console.error('Error creating offer: ', err);
        setIsCalling(false);
      });
  };

  const handlePeerIdChange = (e) => {
    setPeerId(e.target.value);
  };

  // Update remote video element if remote stream changes
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      console.log('Remote video stream set after update.');
    }
  }, [remoteStream]);

  return (
    <div>
      <div className="video-container">
        <div>
          <h3>Your Video</h3>
          <video ref={localVideoRef} autoPlay muted width="300" height="200" />
        </div>

        {remoteStream ? (
          <div>
            <h3>Remote Video</h3>
            <video ref={remoteVideoRef} autoPlay width="300" height="200" />
          </div>
        ) : (
          <p>Waiting for remote peer...</p>
        )}
      </div>

      <div>
        <input
          type="text"
          placeholder="Enter peer ID"
          value={peerId}
          onChange={handlePeerIdChange}
        />
        <button onClick={handleCall} disabled={!peerId || isCallActive || isCalling}>
          {isCalling ? 'Calling...' : 'Start Call'}
        </button>
      </div>

      {isCallActive && <p>Call in progress...</p>}
      
      {hasAnswered && <p>Call Answered</p>}
      
      <div>
        <p>Connection State: {connectionState}</p>
        {connectionState === 'connected' && <p>Connection successfully established!</p>}
      </div>
    </div>
  );
};

export default Meeting;