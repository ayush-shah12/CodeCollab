import React, { useEffect, useState, useRef } from 'react';
import Header from "../Components/Header";
import { Container, Row, Col, Image, Button } from 'react-bootstrap';
import { Peer } from "peerjs";

import CollabCode from '../Components/CollabCode';

const VideoChat = () => {
    const [yourMeetingID, setYourMeetingID] = useState("");
    const [otherMeetingID, setOtherMeetingID] = useState("");
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState(null);
    const [currentCall, setCurrentCall] = useState(null);
    const [endCall, setEndCall] = useState(false);
    const [dataConnection, setDataConnection] = useState(null);
    const [cameraOn, setCameraOn] = useState(true);
    const [micOn, setMicOn] = useState(true);

    const [reset, setReset] = useState(false);

    const peerRef = useRef();

    useEffect(() => {
        const peer = new Peer();

        //auto generating meetingID for current user
        peer.on('open', (id) => {
            setYourMeetingID(id);
        });

        //auto accepts calls, basically an event listner 
        peer.on('call', (call) => {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then(stream => {
                    call.answer(stream);
                    setLocalStream(stream);
                    call.on("stream", (remoteStream) => {
                        setRemoteStreams(remoteStream)
                    })
                    setCurrentCall(call);
                })

                .catch(err => console.error('Error getting user media:', err));
        });

        peer.on('connection', (conn) => {
            conn.on('data', (data) => {
                if (data === 'call ended') {
                    handleRemoteEndCall();
                }
            });
            setDataConnection(conn);
        });

        peerRef.current = peer;

        return () => {
            peer.destroy();
        };
    }, [reset]);

    //allows for outgoing calls
    function handleCall() {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                setLocalStream(stream);
                const call = peerRef.current.call(otherMeetingID, stream);
                setCurrentCall(call);
                call.on('stream', (remoteStream) => {
                    setRemoteStreams(remoteStream);
                });

                const conn = peerRef.current.connect(otherMeetingID);
                conn.on('open', () => {
                    setDataConnection(conn);
                });

            })
            .catch(err => console.error('Error getting user media:', err));
    }

    function handleChange(event) {
        setYourMeetingID(event.target.value);
    }

    function handleOtherChange(event) {
        setOtherMeetingID(event.target.value);
    }

    function endCallFunction() {
        if (currentCall) {
            currentCall.close();
            handleLocalEndCall();
        }
        if (dataConnection) {
            dataConnection.send("call ended");
        }
    }

    function handleLocalEndCall() {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        if (remoteStreams) {
            remoteStreams.getTracks().forEach(track => track.stop());
            setRemoteStreams(null);
        }
        setCurrentCall(null);
    }

    function handleRemoteEndCall() {
        setEndCall(true);
        handleLocalEndCall();
    }

    function resetCallState() {
        if (peerRef.current) {
            peerRef.current.destroy();
        }
        setYourMeetingID("");
        setOtherMeetingID("");
        setEndCall(false);
        setDataConnection(null);
    }

    useEffect(() => {
        if (endCall) {
            resetCallState();
        }
    }, [endCall]);

    function handleMic() {
        setMicOn(!micOn);
    }

    function handleCamera() {
        setCameraOn(!cameraOn);
    }


    return (
        <div>
            <Header />

            <Container className='d-flex flex-column justify-content-around' style={{ "width": "15vw", "position": "absolute", "height": "95vh", "backgroundColor":"#282c34" }}>
                <div className=" d-flex flex-column p-3 rounded">
                    {localStream ? (
                        <video ref={(ref) => ref && (ref.srcObject = localStream)} autoPlay playsInline style={{ "flex": "1", "height": "20vh" }} />)
                        :
                        (<Image src="https://via.placeholder.com/320x240.png?text=Your+Video" rounded style={{ "flex": "1", "height": "20vh" }} />)}


                    <div class="d-flex btn-group justify-content-around mt-2" role="group" aria-label="Basic example">

                        <button type="button" class={micOn ? "btn btn-danger" : "btn btn-success"} onClick={handleMic}>
                            <img src="https://img.icons8.com/ios/50/000000/microphone.png" style={{ "height": "20px" }}></img>
                        </button>
                        <button type="button" class={cameraOn ? "btn btn-danger" : "btn btn-success"} onClick={handleCamera}>
                            <img src="https://img.icons8.com/ios/50/000000/video-call.png" style={{ "height": "20px" }}></img>
                        </button>
                    </div>

                </div>
                <div className='d-flex flex-column p-3 rounded '>
                    {remoteStreams ? (<video ref={(ref) => ref && (ref.srcObject = localStream)} autoPlay playsInline style={{ "flex": "1", "height": "20vh" }} />)
                        :
                        (<Image src="https://via.placeholder.com/320x240.png?text=Their+Video" style={{ "flex": "1", "height": "20vh" }} rounded />)}

                    <div class="d-flex btn-group justify-content-around mt-2" role="group" aria-label="Basic example">

                        <button type="button" class="btn btn-danger">
                            Disconnect
                        </button>
                        <button type="button" class="btn btn-danger">
                            Next
                        </button>

                    </div>

                </div>

            </Container>
            <div style={{ marginLeft: "15vw" }}>
                <CollabCode />
            </div>

        </div>
    )
};


export default VideoChat;
