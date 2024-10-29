import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";
import { Toaster } from "react-hot-toast";
import { useAuthContext } from "./Context/AuthContext";
import CreatePost from "./Components/CreatePost";
import ThreadList from "./Pages/ThreadList";
import CommentList from "./Pages/CommentList";
import VideoCall from "./Pages/Meeting";
import Meeting from "./Pages/Meeting";
import Setup from "./Pages/Setup";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
	const { authUser } = useAuthContext();
	return (
		<>
			<ToastContainer />
			<div>
				<Routes>
					<Route path='/' element={authUser ? <Home/> :<Navigate to='/login'/>} />
					<Route path='/login' element={authUser ? <Navigate to='/' /> : <Login />} />
					<Route path='/signup' element={<SignUp />} />
					<Route path='/setup' element={<Setup fullName={''}/>} />
					<Route path='/post' element={authUser ? <CreatePost/>  : <Login />} />
					<Route path="/call" element = {<Meeting id={'a'}/>} />
					<Route path="/threads" element={<ThreadList/>}/>
					<Route path="/threads/:threadId" element={<CommentList/>} />
				</Routes>
				<Toaster />
			</div>
		</>
	);
}

export default App;
