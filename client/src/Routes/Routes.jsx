import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SignInSide from "../pages/SignInSide";
import SignUpSide from "../pages/SignUpSide";
import HomePage from "../pages/HomePage";
import VideoChat from "../pages/VideoChat";
import CollabCode from "../Components/CollabCode";
import TestCollab from "../pages/TestCollab";


//routing
const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path:"/signIn", element: <SignInSide/>},
  {path:"/signUp", element: <SignUpSide/>},
  {path:"/videoChat", element: <VideoChat/>},
  {path:"/test", element: <TestCollab/>}    //*******************TESTING FILE FOR COLLABORATIVE CODING(IGNORE)*******************
])

export default function RoutesProvider(){
    return <RouterProvider router={router}/>
}