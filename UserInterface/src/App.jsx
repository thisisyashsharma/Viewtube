import { Navbar, Sidebar, MobileBottomNav } from "./components";
import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useMediaQuery } from "./hooks/useMediaQuery";

function App() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [isDrawerOpen, setIsDrawerOpen] = useState(isDesktop);
  const location = useLocation();

  // Sync drawer state with screen size changes
  useEffect(() => {
    setIsDrawerOpen(isDesktop);
  }, [isDesktop]);

  // Close drawer on mobile route changes
  useEffect(() => {
    if (!isDesktop) {
      setIsDrawerOpen(false);
    }
  }, [location.pathname, isDesktop]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (!isDesktop && isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen, isDesktop]);

  return (
    <>
      <Navbar
        isDrawerOpen={isDrawerOpen}
        onToggleDrawer={() => setIsDrawerOpen((prev) => !prev)}
      />
      <div className="flex pt-14 min-h-dvh bg-gray-50 transition-all duration-300">
        <Sidebar
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />
        <div
          id="main-content"
          className={`relative w-full min-h-dvh overflow-y-auto bg-gray-50 transition-[margin] duration-300 ease-in-out ${
            isDesktop && isDrawerOpen ? "lg:ml-52" : "ml-0"
          }`}
        >
          <main className="w-full pb-16 sm:pb-0">
            <Outlet />
          </main>
        </div>
      </div>
      <MobileBottomNav />
    </>
  );
}

export default App;