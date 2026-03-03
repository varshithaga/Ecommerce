import { BrowserRouter as Router } from "react-router-dom";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { appRoutes } from "./appRoutes";
// import { NotificationProvider } from "./context/NotificationContext";
import { LanguageProvider } from "./components/Context/LanguageContext";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  return (
    <LanguageProvider>
      {/* <NotificationProvider> */}
      <Router>
        <ScrollToTop />
        {appRoutes()}
      </Router>
      {/* </NotificationProvider> */}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </LanguageProvider>
  );
}
