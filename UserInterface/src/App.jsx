import { Navbar, Sidebar, MobileBottomNav } from "./components";
import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useMediaQuery } from "./hooks/useMediaQuery";

function App() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [isDrawerOpen, setIsDrawerOpen] = useState(isDesktop);
  const DEFAULT_SIDEBAR_WIDTH = 208;
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [isDraggingSidebar, setIsDraggingSidebar] = useState(false);
  const location = useLocation();

  // Sync drawer state with screen size changes
  useEffect(() => {
    setIsDrawerOpen(isDesktop);
  }, [isDesktop]);

  // Reset sidebar width to default whenever drawer is closed
  useEffect(() => {
    if (!isDrawerOpen) {
      setSidebarWidth(DEFAULT_SIDEBAR_WIDTH);
    }
  }, [isDrawerOpen]);

  // Close drawer on mobile route changes
  useEffect(() => {
    if (!isDesktop) {
      setIsDrawerOpen(false);
      setSidebarWidth(DEFAULT_SIDEBAR_WIDTH);
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
        onToggleDrawer={() => {
          setIsDrawerOpen((prev) => {
            const next = !prev;
            if (!next) {
              setSidebarWidth(DEFAULT_SIDEBAR_WIDTH);
            }
            return next;
          });
        }}
      />
      <div className="flex pt-16 min-h-dvh bg-gray-50 dark:bg-[#0f0f0f] transition-all duration-300">
        <Sidebar
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setSidebarWidth(DEFAULT_SIDEBAR_WIDTH);
          }}
          width={sidebarWidth}
          onWidthChange={setSidebarWidth}
          isDragging={isDraggingSidebar}
          setIsDragging={setIsDraggingSidebar}
        />
        <div
          id="main-content"
          style={{
            marginLeft: isDesktop && isDrawerOpen ? `${sidebarWidth}px` : 0,
          }}
          className={`relative w-full min-h-dvh overflow-y-auto bg-gray-50 dark:bg-[#0f0f0f] ${
            isDraggingSidebar
              ? ""
              : "transition-[margin] duration-300 ease-in-out"
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