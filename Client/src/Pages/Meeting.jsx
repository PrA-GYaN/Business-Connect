import { useSocketContext } from '../Context/SocketContext';
import React, { useEffect, useRef, useState } from 'react';

const VideoCall = () => {
    const { socket } = useSocketContext();
    const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef(new RTCPeerConnection());
  const [targetId, setTargetId] = useState('');

  useEffect(() => {
    const constraints = { video: true, audio: true };
    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach(track => peerConnectionRef.current.addTrack(track, stream));
      });

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('signal', { signal: event.candidate, to: targetId });
      }
    };

    peerConnectionRef.current.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    socket.on('signal', (data) => {
      if (data.signal) {
        peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.signal));
      }
    });

    // Cleanup on unmount
    return () => {
      socket.off('signal');
    };
  }, [targetId]);

  const handleConnect = () => {
    // Create an offer to connect
    peerConnectionRef.current.createOffer()
      .then(offer => {
        return peerConnectionRef.current.setLocalDescription(offer);
      })
      .then(() => {
        socket.emit('signal', { signal: peerConnectionRef.current.localDescription, to: targetId });
      })
      .catch(error => console.error('Error creating offer:', error));
  };

  return (
    <div>
      <h2>Your Socket ID: {socket.id}</h2>
      <input
        type="text"
        placeholder="Enter Socket ID of the user"
        value={targetId}
        onChange={(e) => setTargetId(e.target.value)}
      />
      <button onClick={handleConnect}>Connect</button>
      <video ref={localVideoRef} autoPlay playsInline></video>
      <video ref={remoteVideoRef} autoPlay playsInline></video>
    </div>
  );
};

export default VideoCall;

