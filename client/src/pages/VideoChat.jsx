import React, { useEffect, useState, useRef } from 'react';
import Header from "../Components/Header";
import { Container, Row, Col, Image } from 'react-bootstrap';
import styles from "../styles/VideoChat.module.css";
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


    return (
        <div>
          <Header />
          <Container>
            <Row>
              <Col xs={10} md={3} lg={2} className={styles.column}>
                <Row className="no-gutters">
                  <Col className="p-0">
                    {localStream ? (
                      <video className={styles.image} ref={(ref) => ref && (ref.srcObject = localStream)} autoPlay playsInline />
                    ) : (
                      <Image className={styles.image} src="https://via.placeholder.com/320x240.png?text=Your+Video" rounded />
                    )}
                  </Col>
                </Row>
                <Row className="no-gutters">
                  <Col className="p-0">
                    {remoteStreams ? (
                      <video className={styles.image} ref={(ref) => ref && (ref.srcObject = remoteStreams)} autoPlay playsInline />
                    ) : (
                      <Image className={styles.image} src="https://via.placeholder.com/320x240.png?text=Their+Video" rounded />
                    )}
                  </Col>
                </Row>
              </Col>
              <Col xs={12} md={8} lg={9}>
                <CollabCode />
              </Col>
            </Row>
          </Container>
        </div>
      );
    };
    

export default VideoChat;
