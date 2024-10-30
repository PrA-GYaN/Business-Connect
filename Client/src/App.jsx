import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuthContext } from "./Context/AuthContext";
import Loader from './Components/Loader';
import useListenNotification from './Hooks/useListenNotification';

const Home = lazy(() => import("./Pages/Home"));
const Login = lazy(() => import("./Pages/Login"));
const SignUp = lazy(() => import("./Pages/SignUp"));
const CreatePost = lazy(() => import("./Components/CreatePost"));
const ThreadList = lazy(() => import("./Pages/ThreadList"));
const CommentList = lazy(() => import("./Pages/CommentList"));
const Meeting = lazy(() => import("./Pages/Meeting"));
const Setup = lazy(() => import("./Pages/Setup"));
const Connections = lazy(() => import("./Pages/Connections"));
const Notifications = lazy(() => import("./Pages/Notification"));
const NotFound = lazy(() => import("./Pages/NotFound"));

function App() {
    const { authUser, loading } = useAuthContext();
    useListenNotification();
    if (loading) {
        return <Loader/>
    }

    return (
        <>
            <ToastContainer />
            <div>
                <Suspense fallback={<div>Loading...</div>}>
                    <Routes>
                        <Route path='/' element={authUser ? <Home /> : <Navigate to='/login' />} />
                        <Route path='/login' element={authUser ? <Navigate to='/' /> : <Login />} />
                        <Route path='/signup' element={<SignUp />} />
                        <Route path='/setup' element={<Setup fullName={''} />} />
                        <Route path="/connections" element={authUser ? <Connections /> : <Navigate to='/login' />} />
                        <Route path='/post' element={authUser ? <CreatePost /> : <Navigate to='/login' />} />
                        <Route path="/call" element={<Meeting id={'a'} />} />
                        <Route path="/notifications" element={authUser ? <Notifications /> : <Navigate to='/login' />} />
                        <Route path="/threads" element={<ThreadList />} />
                        <Route path="/threads/:threadId" element={<CommentList />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </div>
        </>
    );
}

export default App;