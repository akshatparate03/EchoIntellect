import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function App() {
  const { pathname } = useLocation();
  const hideChrome = pathname === "/login";

  return (
    <div className="bg-app text-fg flex flex-col min-h-dvh">
      {!hideChrome && <Navbar />}
      <main className="main-content flex-1">
        <Outlet />
      </main>
      {!hideChrome && <Footer />}
    </div>
  );
}
