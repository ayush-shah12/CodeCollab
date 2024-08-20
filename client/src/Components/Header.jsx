import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useContext, useEffect } from 'react';
import { UserContext } from '../UserContext/UserContext';
import { verifyToken, logout } from '../api/auth';

const Header = () => {

  const { userInfo, setUserInfo } = useContext(UserContext);

  const username = userInfo?.username;

  function handleLogout(){
    logout();
    setUserInfo(null);
  }

  useEffect(() => {
    async function checkToken() {
        const response = await verifyToken();
        const responseBody = await response.json();
        if (responseBody!=null) {
            setUserInfo({ email: responseBody.email, username: responseBody.username });
        } else {
            setUserInfo(null);
        }
    }
    checkToken();
}, [setUserInfo]);

  return (
    <Navbar bg="primary" data-bs-theme="dark" expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="/">CodeCollab</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {!username && (
              <>
                <Nav.Link className="mx-4" href="/SignIn">Sign In</Nav.Link>
                <Nav.Link className="mx-4" href="/SignUp">Sign Up</Nav.Link>
                <Nav.Link className="mx-4" href="/">About</Nav.Link>
                <Nav.Link className="mx-4" href="/">Feedback</Nav.Link>
                <Nav.Link className="mx-4" href="/">Github</Nav.Link>
              </>
            )}
            {username && (
              <>
                <Nav.Link className="mx-4" href="/VideoChat">Start Coding with a Stranger!</Nav.Link>
                <Nav.Link className="mx-4" href="/">Code with Friends!</Nav.Link>
                <Nav.Link className="mx-4" href="/">About</Nav.Link>
                <Nav.Link className="mx-4" href="/">Feedback</Nav.Link>
                <Nav.Link className="mx-4" href="/">Github</Nav.Link>
                <Nav.Link className='mx-4' onClick={handleLogout}>Logout</Nav.Link>
              </>
            )}
          </Nav>
          {username && (
            <Navbar.Brand className="ms-auto" href="/">Welcome {username}</Navbar.Brand>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;