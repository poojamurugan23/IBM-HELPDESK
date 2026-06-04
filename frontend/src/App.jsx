import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardCustomer from "./pages/DashboardCustomer";
import DashboardAgent from "./pages/DashboardAgent";
import DashboardAdmin from "./pages/DashboardAdmin";
import KnowledgeBase from "./pages/KnowledgeBase";
import TestChat from "./pages/TestChat";

import socket from "./socket"; // ✅ Socket instance

function App() {
  console.log("🧠 App.jsx loaded");

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected to socket:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from socket");
    });

    // Cleanup
    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/customer" element={<DashboardCustomer />} />
        <Route path="/agent" element={<DashboardAgent />} />
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/knowledge-base" element={<KnowledgeBase />} />
        <Route path="/test-chat" element={<TestChat />} />
      </Routes>
    </>
  );
}

export default App;