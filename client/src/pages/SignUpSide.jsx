import Header from "../Components/Header"
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom"
import { signUp, signIn } from "../api/auth";
import { UserContext } from "../UserContext/UserContext";

const SignUpSide = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [redirect, setRedirect] = useState(false);

  const {setUserInfo} = useContext(UserContext);

  const navigate = useNavigate();

  useEffect(() => {
    if (redirect) {
      navigate("/");
    }
  });

  function handleEmailChange(event) {
    setEmail(event.target.value);
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }

  function handleUsernameChange(event) {
    setUsername(event.target.value);
  }

  function checkInput(event) {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    event.preventDefault();
    if (!username || !password || !email) {
      alert("All Fields Required!");
    }
    else if ((!(username.length > 5)) || !(password.length > 5)) {
      alert("Username/Password must be over 5 characters!")
    }
    else if (!(emailRegex.test(email))) {
      alert("Invalid Email");
    }
    else {
      handleRegister();
    }
  }

  const handleRegister = async () => {
    try {
      const response = await signUp(username, password, email);

      const responseBody = await response.json();

      if (response.ok) {
        alert("User registered successfully. Now Signing In!");
        const r = await signIn(email, password);
        if(r.status === 200){
          setUserInfo({email:email, username:username});
        }
        setRedirect(true);
      } 
      else {
        alert(responseBody.error || "Registration failed");
      }
    } 
    catch (error) {
      console.error('Fetch error:', error);
      alert("An error occurred while registering.");
    }
  };

  return (
    <div>
      <Header />
      <div style={{ display: "flex", justifyContent: "center", padding: "50px 0px 0px 0px" }}>
        <h1>Sign Up to Start Coding!</h1>
      </div>

      <Container className="d-flex justify-content-center align-items-center" style={{ height: '75vh' }}>
        <Row className="w-100">
          <Col md={6} lg={4} className="mx-auto">
            <Form>

              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Username</Form.Label>
                <Form.Control type="text" placeholder="Username" value={username} onChange={handleUsernameChange} />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control type="email" placeholder="Enter email" value={email} onChange={handleEmailChange} />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Password" value={password} onChange={handlePasswordChange} />
              </Form.Group>
              <div className="d-grid gap-2">
                <Button variant="dark" type="submit" onClick={checkInput}>
                  Sign up
                </Button>
              </div>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default SignUpSide;