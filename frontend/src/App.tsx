import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function App() {
  const { pathname } = useLocation();
  const hideChrome = pathname === "/login";

  // Routes that use fixed header/footer layout
  const fixedLayoutRoutes = ["/", "/contact"];
  const isFixedLayout = fixedLayoutRoutes.includes(pathname);

  return (
    <div
      className={`bg-app text-fg flex flex-col min-h-dvh ${
        isFixedLayout ? "fixed-layout" : ""
      }`}
    >
      {!hideChrome && <Navbar />}
      <main className="main-content flex-1">
        <Outlet />
      </main>
      {!hideChrome && <Footer />}
    </div>
  );
}
