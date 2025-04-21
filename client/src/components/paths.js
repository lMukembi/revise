import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./home";
import { Login } from "./login";
import { Signup } from "./signup";
import { AdminLogin } from "./adminlogin";
import { Admin } from "./admin";
import { Addexam } from "./addexam";

const Paths = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/:id" element={<Admin />} />
        <Route path="/add-exam" element={<Addexam />} />
      </Routes>
    </Router>
  );
};

export default Paths;
