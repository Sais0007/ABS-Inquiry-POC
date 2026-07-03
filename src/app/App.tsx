import { useState, useEffect } from "react";
import logoDefault from "../assets/1b7ab447194c5f0fc1b269452281b2173e53bd29.png";
import absLogo from "../assets/abs_logo.png";
import absBox from "../assets/abs_box.png";
import { Toaster } from "sonner";
import { Sidebar } from "./components/Sidebar";
import { GlobalHeader } from "./components/GlobalHeader";
import UIKit from "./components/UIKit";
import SampleDesign from "./components/SampleDesign";
import UserManagement from "./components/UserManagement";
import EventManagement from "./components/EventManagement";
import StaticPages from "./components/StaticPages";
import SystemSettings from "./components/SystemSettings";
import MasterManagement from "./components/MasterManagement";
import EmailTemplates from "./components/EmailTemplates";
import SystemNotifications from "./components/SystemNotifications";
import RoleManagement from "./components/RoleManagement";
import LogsPage from "./components/LogsPage";
import { SiteMap } from "./components/SiteMap";
import { FeedbackSystem } from "./components/FeedbackSystem";
import { GlobalFooter } from "./components/GlobalFooter";
import { LanguageProvider } from "../i18n/LanguageContext";

// ABS Inquiry Processing POC components
import LoginScreen from "./components/LoginScreen";
import InquiryListing from "./components/InquiryListing";
import InquiryDetails from "./components/InquiryDetails";

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      return saved === "dark";
    }
    return false;
  });

  const [currentTheme, setCurrentTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("colorTheme");
      const validThemes = ["default-black", "ocean-blue", "emerald-green", "violet-purple", "amber-orange"];
      return validThemes.includes(saved || "") ? saved! : "default-black";
    }
    return "default-black";
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] =
    useState(false);

  const [menuOrientation, setMenuOrientation] = useState<
    "vertical" | "horizontal"
  >(() => {
    if (typeof window !== "undefined") {
      return (
        (localStorage.getItem(
          "menuOrientation",
        ) as "vertical" | "horizontal") || "vertical"
      );
    }
    return "vertical";
  });

  // Default landing page for the ABS POC is now inquiry-listing
  const [currentPage, setCurrentPage] = useState("inquiry-listing");
  const [selectedInquiryId, setSelectedInquiryId] = useState("");
  const [inquiryMode, setInquiryMode] = useState<"view" | "edit">("view");

  const [logoUrl, setLogoUrl] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("platformLogo") || absLogo;
    }
    return absLogo;
  });

  // ABS Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("abs_authenticated") === "true";
    }
    return false;
  });

  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("abs_user");
      return user ? JSON.parse(user) : null;
    }
    return null;
  });

  useEffect(() => {
    // Clear platformLogo from localStorage to force load of the new ABS logo
    localStorage.removeItem("platformLogo");
    setLogoUrl(absLogo);
  }, []);

  /* -------------------- Theme Effects -------------------- */
  useEffect(() => {
    const root = document.documentElement;

    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem("colorTheme", currentTheme);
    document.documentElement.setAttribute(
      "data-theme",
      currentTheme,
    );
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem("menuOrientation", menuOrientation);
  }, [menuOrientation]);

  // Auth Handlers
  const handleLoginSuccess = (user: { name: string; email: string }) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    localStorage.setItem("abs_authenticated", "true");
    localStorage.setItem("abs_user", JSON.stringify(user));
    setCurrentPage("inquiry-listing");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem("abs_authenticated");
    localStorage.removeItem("abs_user");
  };

  const handleNavigate = (pageId: string) => {
    setCurrentPage(pageId);
  };

  // If not logged in, render LoginScreen in isolation (no sidebar/header/footer)
  if (!isAuthenticated) {
    return (
      <LanguageProvider>
        <LoginScreen onLoginSuccess={handleLoginSuccess} logoUrl={absLogo} />
        <Toaster
          position="top-right"
          expand
          richColors
          closeButton
          theme={isDark ? "dark" : "light"}
        />
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors">
      {/* Sidebar */}
      <Sidebar
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() =>
          setIsSidebarCollapsed(!isSidebarCollapsed)
        }
        currentPage={currentPage}
        onNavigate={handleNavigate}
        logoUrl={absLogo}
        menuOrientation={menuOrientation}
        currentUser={currentUser}
      />

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          menuOrientation === "horizontal"
            ? "ml-0"
            : isSidebarCollapsed
              ? "ml-16"
              : "ml-64"
        } pb-14`}
      >
        {/* Global Header */}
        <GlobalHeader
          isDarkMode={isDark}
          onToggleDarkMode={() => setIsDark(!isDark)}
          isSidebarCollapsed={isSidebarCollapsed}
          currentTheme={currentTheme}
          onThemeChange={setCurrentTheme}
          logoUrl={absLogo}
          menuOrientation={menuOrientation}
          onMenuOrientationChange={setMenuOrientation}
          currentPage={currentPage}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Page Content */}
        {currentPage === "inquiry-details" ? (
          <InquiryDetails 
            inquiryId={selectedInquiryId} 
            onBack={() => setCurrentPage("inquiry-listing")}
            onSelectInquiry={(id) => setSelectedInquiryId(id)}
            initialMode={inquiryMode}
          />
        ) : currentPage === "inquiry-listing" ? (
          <InquiryListing 
            onSelectInquiry={(id, mode) => {
              setSelectedInquiryId(id);
              setInquiryMode(mode || "view");
              setCurrentPage("inquiry-details");
            }}
          />
        ) : currentPage === "ui-kit" ? (
          <UIKit />
        ) : currentPage === "sample-design" ? (
          <SampleDesign />
        ) : currentPage === "user-management" ? (
          <UserManagement />
        ) : currentPage === "event-management" ? (
          <EventManagement />
        ) : currentPage === "static-pages" ? (
          <StaticPages />
        ) : currentPage === "system-settings" ? (
          <SystemSettings logoUrl={logoUrl} onLogoChange={setLogoUrl} />
        ) : currentPage === "country" ? (
          <MasterManagement masterType="country" />
        ) : currentPage === "state" ? (
          <MasterManagement masterType="state" />
        ) : currentPage === "city" ? (
          <MasterManagement masterType="city" />
        ) : currentPage === "role-management" ? (
          <RoleManagement />
        ) : currentPage === "email-templates" ? (
          <EmailTemplates />
        ) : currentPage === "system-notifications" ? (
          <SystemNotifications />
        ) : currentPage === "logs" ? (
          <LogsPage />
        ) : currentPage === "site-map" ? (
          <SiteMap onNavigate={handleNavigate} currentPage={currentPage} />
        ) : (
          <div className="p-6 text-neutral-500">
            {currentPage === "dashboard" && "Dashboard - Select a module to preview UI components"}
            {currentPage === "company-profile" && "Company Profile Page"}
            {currentPage !== "dashboard" && currentPage !== "company-profile" && "Select a module to preview UI components"}
          </div>
        )}

        {/* Global Footer */}
        <GlobalFooter 
          isSidebarCollapsed={isSidebarCollapsed} 
          menuOrientation={menuOrientation} 
        />
      </main>

      {/* Global Feedback System */}
      <FeedbackSystem />

      {/* Toast */}
      <Toaster
        position="top-right"
        expand
        richColors
        closeButton
        theme={isDark ? "dark" : "light"}
      />
    </div>
    </LanguageProvider>
  );
}