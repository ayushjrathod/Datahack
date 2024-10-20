import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import AboutUsPage from "./pages/Aboutus";
import Chatbot from "./pages/Chatbot";
import ContactUsPage from "./pages/Contactus";
import Home from "./pages/Home";
import ResourcesPage from "./pages/Resources";

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
          </Route>
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/aboutus" element={<Layout />}>
            <Route index element={<AboutUsPage />} />
          </Route>
          <Route path="/resources" element={<Layout />}>
            <Route index element={<ResourcesPage />} />
          </Route>
          <Route path="/contactus" element={<Layout />}>
            <Route index element={<ContactUsPage />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
};

export default App;
