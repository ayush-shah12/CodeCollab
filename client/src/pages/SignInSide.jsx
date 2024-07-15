import Header from "../Components/Header"
import { useState, useContext, useEffect } from "react";
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { signIn } from "../api/auth";
import { UserContext } from "../UserContext/UserContext";
import {useNavigate} from "react-router-dom";

const SignInSide = () => {

  const navigate = useNavigate();
  const [redirect, setRedirect] = useState(false);

  useEffect(() =>{
    if(redirect)
        navigate("/")
  })

  const {setUserInfo} = useContext(UserContext);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  function handleEmailChange(event) {
    setEmail(event.target.value);
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }

  function checkInput(event) {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    event.preventDefault();
    if (!password || !email) {
      alert("All Fields Required!");
    }
    else if (!(emailRegex.test(email))) {
      alert("Invalid Email");
    }
    else {
      handleLogin();
    }
  }

  async function handleLogin() {
    try {
      const response = await signIn(email, password);

      const responseBody = await response.json();

      switch (response.status) {
        case 200:
          setUserInfo({email:responseBody.email, username:responseBody.username});
          alert("sign in successful");
          setRedirect(true);
          break;
        case 400:
          alert("incorrect password");
          break;
        case 500:
          alert("Cannot Find Provided Email");
          break;
      }
    }
    catch (error) {
      console.error('Fetch error:', error);
      alert("An error occurred while SIGNING IN.");
    }
  };


  return (
    <div>
      <Header />
      <div style={{ display: "flex", justifyContent: "center", padding: "50px 0px 0px 0px" }}>
        <h1>Sign In to Start Coding!</h1>
      </div>
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '75vh' }}>
        <Row className="w-100">
          <Col md={6} lg={4} className="mx-auto">
            <Form>
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
                  Log In
                </Button>
              </div>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default SignInSide;