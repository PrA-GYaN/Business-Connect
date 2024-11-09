import { useEffect, useState, useRef } from "react";
import { useSocketContext } from "../Context/SocketContext";

const useCall = (socketId, stream, me, name) => {
  const [receivingCall, setReceivingCall] = useState(false);
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [caller, setCaller] = useState("");
  const [idToCall, setIdToCall] = useState(null);
  const remoteVideoRef = useRef(null);
  const connectionRef = useRef();
  const socket = useSocketContext().socket;

  useEffect(() => {
    if (socketId) {
      setIdToCall(socketId);
    }
  }, [socketId]);

  useEffect(() => {
    const handleIncomingCall = (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerSignal(data.signalData);
    };

    socket.on("callUser", handleIncomingCall);

    return () => {
      socket.off("callUser", handleIncomingCall);
    };
  }, [socket]);

  const callUser = (id) => {
    if (!stream) {
      console.error("No stream available to make the call");
      return;
    }

    const peer = new RTCPeerConnection();

    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("callUser", {
          userToCall: id,
          signalData: { type: peer.localDescription.type, sdp: peer.localDescription.sdp },
          from: me,
          name: name,
        });
      }
    };

    peer.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peer.createOffer()
      .then((offer) => peer.setLocalDescription(offer))
      .catch((error) => console.error("Error creating or sending offer:", error));

    socket.on("answerCall", (signal) => {
      peer.setRemoteDescription(new RTCSessionDescription(signal));
      setCallAccepted(true);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    if (!stream) {
      console.error("No stream available to answer the call");
      return;
    }

    const peer = new RTCPeerConnection();
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    console.log(callerSignal);
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("answerCall", {
          signal: { type: peer.localDescription.type, sdp: peer.localDescription.sdp },
          to: caller,
        });
      }
    };

    peer.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    if (callerSignal) {
      peer.setRemoteDescription(new RTCSessionDescription(callerSignal))
        .then(() => peer.createAnswer())
        .then((answer) => peer.setLocalDescription(answer))
        .catch((error) => console.error("Error while answering the call:", error));
    }

    connectionRef.current = peer;
    setCallAccepted(true);
  };

  const leaveCall = () => {
    setCallEnded(true);
    if (connectionRef.current) {
      connectionRef.current.close();
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  return {
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
  };
};

export default useCall;