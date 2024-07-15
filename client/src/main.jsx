import React from "react";
import ReactDOM from 'react-dom/client';
import RoutesProvider from "./Routes/Routes.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { UserContextProvider } from "./UserContext/UserContext.jsx";

ReactDOM.createRoot(document.getElementById('root')).render(
  <UserContextProvider>

    <RoutesProvider />

  </UserContextProvider>

)

