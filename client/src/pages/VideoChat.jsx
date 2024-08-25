import React, { useEffect, useState, useRef } from 'react';
import Header from "../Components/Header";
import { Container, Row, Col, Image, Button } from 'react-bootstrap';
import Peer from 'peerjs';

import CollabCode from '../Components/CollabCode';

const VideoChat = () => {
    const [peerId, setPeerId] = useState('');
    const [remotePeerId, setRemotePeerId] = useState('');
    const [customRoomId, setCustomRoomId] = useState('');
    const [roomId, setRoomId] = useState('');
    const [myStream, setMyStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const myVideoRef = useRef();
    const remoteVideoRef = useRef();
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(true);

    const peer = useRef(null);

    useEffect(() => {
        peer.current = new Peer({
            host: 'localhost',
            port: 4000,
            path: '/peerjs/myapp',
            secure: false,
        });

        peer.current.on('open', id => {
            setPeerId(id);
        });

        peer.current.on('call', call => {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
                setMyStream(stream);
                myVideoRef.current.srcObject = stream;
                call.answer(stream);
                call.on('stream', remoteStream => {
                    setRemoteStream(remoteStream);
                    remoteVideoRef.current.srcObject = remoteStream;
                });
            });
        });

        return () => {
            peer.current.destroy();
        };
    }, []);

    const createRoom = async () => {
        if (customRoomId.trim()) {
            try {
                const response = await fetch('http://localhost:4000/create-room', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ roomId: customRoomId.trim() }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setRoomId(data.roomId);
                } else {
                    console.error('Failed to create room:', response.statusText);
                }
            } catch (error) {
                console.error('Error creating room:', error);
            }
        } else {
            alert('Please enter a valid room ID');
        }
    };

    const joinRoom = () => {
        if (remotePeerId) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
                setMyStream(stream);
                myVideoRef.current.srcObject = stream;
                const call = peer.current.call(remotePeerId, stream);
                call.on('stream', remoteStream => {
                    setRemoteStream(remoteStream);
                    remoteVideoRef.current.srcObject = remoteStream;
                });
            });
        }
    };

    const toggleMute = () => {
        if (myStream) {
            myStream.getAudioTracks()[0].enabled = !myStream.getAudioTracks()[0].enabled;
            setIsMuted(!isMuted);
        }
    };

    const toggleCamera = () => {
        if (myStream) {
            myStream.getVideoTracks()[0].enabled = !myStream.getVideoTracks()[0].enabled;
            setIsCameraOn(!isCameraOn);
        }
    };

    return (
        <div>
            <Header />

            <Container className='d-flex flex-column justify-content-around' style={{ "width": "15vw", "position": "absolute", "height": "95vh", "backgroundColor":"#282c34" }}>
                <div className=" d-flex flex-column p-3 rounded">
                    <video ref={myVideoRef} autoPlay muted style={{backgroundColor: 'black', "flex": "1", "height": "20vh" }} />


                    <div className ="d-flex btn-group justify-content-around mt-2" role="group" aria-label="Basic example">

                        <button type="button" className ={isMuted ? "btn btn-danger" : "btn btn-success"} onClick={toggleMute}>
                            <img src="https://img.icons8.com/ios/50/000000/microphone.png" style={{ "height": "20px" }}></img>
                        </button>
                        <button type="button" className ={isCameraOn ? "btn btn-danger" : "btn btn-success"} onClick={toggleCamera}>
                            <img src="https://img.icons8.com/ios/50/000000/video-call.png" style={{ "height": "20px" }}></img>
                        </button>
                    </div>

                </div>
                <div className='d-flex flex-column p-3 rounded '>
                    <video ref={remoteVideoRef} autoPlay style={{backgroundColor: 'black', "flex": "1", "height": "20vh" }} />

                    <div className ="d-flex btn-group justify-content-around mt-2" role="group" aria-label="Basic example">

                        <button type="button" className ="btn btn-danger">
                            Disconnect
                        </button>
                        <button type="button" className ="btn btn-danger">
                            Next
                        </button>
                    </div>

                </div>
            <div>
                <h2>Your ID: {peerId}</h2>
                <input
                    type="text"
                    value={customRoomId}
                    onChange={(e) => setCustomRoomId(e.target.value)}
                    placeholder="Enter custom room ID"
                />
                <button onClick={createRoom}>Create Room</button>
                {roomId && <p>Room ID: {roomId} (Share this ID with others to join)</p>}
            </div>
            <div>
                <input
                    type="text"
                    value={remotePeerId}
                    onChange={(e) => setRemotePeerId(e.target.value)}
                    placeholder="Enter Room ID to join"
                />
                <button onClick={joinRoom}>Join Room</button>
            </div>

            </Container>
            <div style={{ marginLeft: "15vw" }}>
                <CollabCode />
            </div>

        </div>
    )
};


export default VideoChat;
