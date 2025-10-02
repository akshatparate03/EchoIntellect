import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function App() {
  const { pathname } = useLocation();
  const hideChrome = pathname === "/login";
  return (
    <div className="min-h-dvh bg-app text-fg flex flex-col">
      {!hideChrome && <Navbar />}
      <main className="flex-1">{<Outlet />}</main>
      {!hideChrome && <Footer />}
    </div>
  );
}
