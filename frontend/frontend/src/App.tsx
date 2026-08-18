import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Customers from "./pages/Customers";
import Quotes from "./pages/Quotes";
import Applications from "./pages/Applications";

function App() {
  return (
    <BrowserRouter>
      <div>
        <nav>
          <Link to="/customers">Customers</Link>
          <Link to="/quotes">Quotes</Link>
          <Link to="/applications">Applications</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Customers />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/applications" element={<Applications />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;