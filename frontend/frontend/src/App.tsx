import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Quotes from "./pages/Quotes";
import Applications from "./pages/Applications";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/applications" element={<Applications />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;