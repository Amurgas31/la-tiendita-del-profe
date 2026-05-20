import { BrowserRouter as Router, Routes, Route } from "react-router";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Products from "./pages/Products";
import Register from "./pages/Register";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
