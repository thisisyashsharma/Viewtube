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

  // Mobile / Android Touch Edge-Swipe Gesture Handlers
  useEffect(() => {
    if (isDesktop) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let isSwiping = false;

    const handleTouchStart = (e) => {
      if (!e.touches || e.touches.length > 1) return;
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = Date.now();
      isSwiping = false;
    };

    const handleTouchMove = (e) => {
      if (!e.touches || e.touches.length > 1) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;

      // Ignore if vertical scrolling is dominant
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 15) {
        return;
      }

      // 1. Swipe Right to Open (when closed and swipe starts in left 30% area)
      if (!isDrawerOpen && touchStartX < window.innerWidth * 0.3 && deltaX > 30) {
        isSwiping = true;
      }

      // 2. Swipe Left to Close (when open and swipe moves towards left)
      if (isDrawerOpen && deltaX < -30) {
        isSwiping = true;
      }
    };

    const handleTouchEnd = (e) => {
      if (!isSwiping || !e.changedTouches) return;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      const elapsedTime = Date.now() - touchStartTime;

      // Horizontal gesture priority
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Open drawer on right swipe
        if (!isDrawerOpen && touchStartX < window.innerWidth * 0.3) {
          if (deltaX > 40 || (deltaX > 25 && elapsedTime < 250)) {
            setIsDrawerOpen(true);
          }
        }
        // Close drawer on left swipe
        if (isDrawerOpen) {
          if (deltaX < -40 || (deltaX < -25 && elapsedTime < 250)) {
            setIsDrawerOpen(false);
          }
        }
      }
      isSwiping = false;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDesktop, isDrawerOpen]);

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
      <MobileBottomNav
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
    </>
  );
}

export default App;