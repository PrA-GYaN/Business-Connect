import React, { useEffect, useRef, useState } from "react";
import { useSocketContext } from "../Context/SocketContext";
import { useAuthContext } from "../Context/AuthContext";

function Meeting({ id }) {
    const { socket } = useSocketContext();
    const { fullName } = useAuthContext();
    const [me, setMe] = useState("");
    const [stream, setStream] = useState();
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState("");
    const [callerSignal, setCallerSignal] = useState();
    const [callAccepted, setCallAccepted] = useState(false);
    const [idToCall, setIdToCall] = useState(id);
    const [callEnded, setCallEnded] = useState(false);
    const [name, setName] = useState(fullName);
    const myVideo = useRef(null);
    const userVideo = useRef(null);
    const connectionRef = useRef();

    useEffect(() => {
        // Access user media
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                setStream(stream);
                if (myVideo.current) {
                    myVideo.current.srcObject = stream;
                }
            })
            .catch((error) => {
                console.error("Error accessing media devices:", error);
            });

        setMe(socket.id);

        // Listen for incoming calls
        const callUserListener = (data) => {
            console.log("Received callUser data:", data);
            if (data?.signal) {
                setReceivingCall(true);
                setCaller(data.from);
                setCallerSignal(data.signal);
                setName(data.name);
                console.log("Incoming call from:", data.name);
            } else {
                console.error("Invalid callUser data:", data);
            }
        };

        socket.on("callUser", callUserListener);

        return () => {
            // Clean up listeners
            socket.off("callUser", callUserListener);
        };
    }, [socket]);

    useEffect(() => {
        if (stream && myVideo.current) {
            myVideo.current.srcObject = stream;
        }
    }, [stream]);

    const callUser = (id) => {
        const peer = new RTCPeerConnection();
        stream.getTracks().forEach(track => peer.addTrack(track, stream));

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
            if (userVideo.current) {
                userVideo.current.srcObject = event.streams[0];
            }
        };

        peer.createOffer()
            .then((offer) => {
                return peer.setLocalDescription(offer);
            })
            .then(() => {
                console.log("Call offer sent to:", id);
            })
            .catch((error) => {
                console.error("Error creating or sending offer:", error);
            });

        socket.on("callAccepted", (signal) => {
            console.log("Call accepted with signal:", signal);
            setCallAccepted(true);
            peer.setRemoteDescription(new RTCSessionDescription(signal))
                .catch((error) => console.error("Error setting remote description:", error));
        });

        connectionRef.current = peer;
    };

    const answerCall = () => {
        const peer = new RTCPeerConnection();
        stream.getTracks().forEach(track => peer.addTrack(track, stream));

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("answerCall", { signal: { type: peer.localDescription.type, sdp: peer.localDescription.sdp }, to: caller });
            }
        };

        peer.ontrack = (event) => {
            if (userVideo.current) {
                userVideo.current.srcObject = event.streams[0];
            }
        };

        // Log the callerSignal for debugging
        console.log("Caller Signal before setRemoteDescription:", callerSignal);

        if (callerSignal && callerSignal.type && callerSignal.sdp) {
            const remoteDescription = new RTCSessionDescription(callerSignal);
            console.log("Setting remote description:", remoteDescription);
            
            peer.setRemoteDescription(remoteDescription)
                .then(() => {
                    console.log("Remote description set successfully.");
                    return peer.createAnswer();
                })
                .then((answer) => {
                    console.log("Answer created:", answer);
                    return peer.setLocalDescription(answer);
                })
                .then(() => {
                    console.log("Local description set successfully.");
                })
                .catch((error) => {
                    console.error("Error during answering call:", error);
                });
        } else {
            console.error("callerSignal is not defined or invalid:", callerSignal);
        }

        connectionRef.current = peer;
        setCallAccepted(true);
    };

    const leaveCall = () => {
        setCallEnded(true);
        if (connectionRef.current) {
            connectionRef.current.close();
        }
    };

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
                        <h1>{name} is calling...</h1>
                        <button onClick={answerCall}>Answer</button>
                    </div>
                )}
            </div>
        </>
    );
}

export default Meeting;