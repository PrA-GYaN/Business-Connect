import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthContextProvider } from "./Context/AuthContext.jsx";
import { SocketContextProvider } from "./Context/SocketContext.jsx";
import { NotificationProvider } from "./Context/NotificationContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
	<BrowserRouter>
		<AuthContextProvider>
			<SocketContextProvider>
				<NotificationProvider>
					<App />
				</NotificationProvider>
			</SocketContextProvider>
		</AuthContextProvider>
	</BrowserRouter>
);
