import React, { Suspense, useState, lazy } from 'react';
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuthContext } from "./Context/AuthContext";
import Loader from './Components/Loader';
import useListenNotification from './Hooks/useListenNotification';
import useListenMessages from './Hooks/useListenMessages';
import useListenCall from './Hooks/useListenCall';
import CallModal from './Components/CallModal';
import MeetingList from './Pages/MeetingList';
import { useNavigate } from 'react-router-dom';

const Home = lazy(() => import("./Pages/Home"));
// const {AdminRoute} = lazy(() => import("./Components/AdminRoute"));
const ForgotPassword = lazy(() => import("./Components/ForgotPassword"));
const Login = lazy(() => import("./Pages/Login"));
const SignUp = lazy(() => import("./Pages/SignUp"));
const CreateThread = lazy(() => import("./Components/CreateThread"));
const Messages = lazy(() => import("./Pages/Messages"));
const ThreadList = lazy(() => import("./Pages/ThreadList"));
const CommentList = lazy(() => import("./Pages/CommentList"));
const Meeting = lazy(() => import("./Pages/Meeting"));
const Setup = lazy(() => import("./Pages/Setup"));
const Connections = lazy(() => import("./Pages/Connections"));
const Profile = lazy(() => import("./Pages/Profile"));
const Notifications = lazy(() => import("./Pages/Notification"));
const NotFound = lazy(() => import("./Pages/NotFound"));
const UserAdmin = lazy(() => import("./Pages/UserAdmin"));

function App() {
    const navigate = useNavigate();
    const { authUser, loading } = useAuthContext();
    const [isCallModalOpen, setIsCallModalOpen] = useState(false);
    const [caller, setCaller] = useState(''); 

    const handleIncomingCall = (data) => {
        setCaller(data);
        setIsCallModalOpen(true);
    };

    const acceptCall = () => {
        setIsCallModalOpen(false);
        navigate('/call');
      };
    
      const rejectCall = () => {
        setIsCallModalOpen(false)
      };

    useListenNotification();
    useListenMessages();
    useListenCall(handleIncomingCall);
    

    if (loading) {
        return <Loader />
    }

    return (
        <>
            <ToastContainer />
            <div>
                <Suspense fallback={<Loader />}>
                    <Routes>
                        <Route path='/' element={authUser ? <Home /> : <Navigate to='/login' />} />
                        <Route path='/login' element={authUser ? <Navigate to='/' /> : <Login />} />
                        <Route path='/forgot-password' element={<ForgotPassword />} />
                        <Route path='/signup' element={<SignUp />} />
                        <Route path='/setup' element={<Setup fullName={''} />} />
                        {/* <AdminRoute path="/admin" element={<UserAdmin />} /> */}
                        
                        <Route path="/connections" element={authUser ? <Connections /> : <Navigate to='/login' />} />
                        <Route path="/messages" element={authUser ? <Messages /> : <Navigate to='/login' />} />
                        
                        <Route path="/meeting" element={authUser ? <MeetingList /> : <Navigate to='/login' />} />
                        <Route path="/call" element={<Meeting />} />
                        
                        <Route path="/notifications" element={authUser ? <Notifications /> : <Navigate to='/login' />} />
                        <Route path="/threads" element={authUser ? <ThreadList /> : <Navigate to='/login' />} />
                        <Route path="/create" element={authUser ? <CreateThread /> : <Navigate to='/login' />} />
                        <Route path="/threads/:threadId" element={<CommentList />} />
                        <Route path="/profile" element={authUser ? <Profile /> : <Navigate to='/login' />} />
                        <Route 
                            path="/admin" 
                            element={authUser === '6789c4d95460a8925b9e0a0a' ? <UserAdmin /> : <NotFound />} 
                            />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </div>
            <CallModal
                isOpen={isCallModalOpen}
                caller={caller}
                onAccept={acceptCall}
                onReject={rejectCall}
            />
        </>
    );
}

export default App;