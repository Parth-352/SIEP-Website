"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePwaInstall } from '@/components/PwaInstallProvider';
import { TEAMS } from '@/lib/teams';
import { isParthMasterAdmin } from '@/lib/members';
import NotificationDrawer from '@/components/notifications/NotificationDrawer';
import RulebookCopilotDrawer from '@/components/copilot/RulebookCopilotDrawer';
import { generateDeckNotifications } from '@/lib/notifications';
import { Task, ResearchMaterial } from '@/lib/types';
import DesktopPortalNav from './navigation/DesktopPortalNav';
import DesktopPublicNav from './navigation/DesktopPublicNav';
import MobileSlideDrawer from './navigation/MobileSlideDrawer';
import GlobalMobileBottomBar from './navigation/GlobalMobileBottomBar';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const { user, isAdmin, isCore, isLead, logout } = useAuth();
  const { isInstalled, isStandalone, installApp } = usePwaInstall();
  const currentTeam = user ? TEAMS[user.teamId] : null;
  const isPortalOnly = process.env.NEXT_PUBLIC_PORTAL_ONLY === 'true';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isPortalPage = isPortalOnly || isStandalone || pathname.startsWith('/log') || pathname.startsWith('/dashboard');

  // Track active dashboard tab from URL search parameters for active pill highlight
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [deckTasks, setDeckTasks] = useState<Task[]>([]);
  const [deckMaterials, setDeckMaterials] = useState<ResearchMaterial[]>([]);
  const [deckNotificationsCount, setDeckNotificationsCount] = useState<number>(0);
  const deckTasksRef = useRef<Task[]>([]);
  const deckMaterialsRef = useRef<ResearchMaterial[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchDeckData = async () => {
      try {
        const [taskRes, matRes] = await Promise.all([
          fetch('/api/tasks').then((r) => r.json()).catch(() => ({ tasks: [] })),
          fetch('/api/materials').then((r) => r.json()).catch(() => ({ materials: [] })),
        ]);
        const tasksList = Array.isArray(taskRes.tasks) ? taskRes.tasks : [];
        const matsList = Array.isArray(matRes.materials) ? matRes.materials : [];
        setDeckTasks(tasksList);
        setDeckMaterials(matsList);
        deckTasksRef.current = tasksList;
        deckMaterialsRef.current = matsList;

        const list = generateDeckNotifications(user, tasksList, matsList);
        const unread = list.filter((n) => !n.read && n.isPersonalDeck).length;
        setDeckNotificationsCount(unread);
      } catch {
        // ignore
      }
    };
    fetchDeckData();

    const handleNotifsUpdated = () => {
      if (!user) return;
      const list = generateDeckNotifications(user, deckTasksRef.current, deckMaterialsRef.current);
      const unread = list.filter((n) => !n.read && n.isPersonalDeck).length;
      setDeckNotificationsCount(unread);
    };

    const handleOpenNotifs = () => setIsNotificationDrawerOpen(true);
    const handleOpenCopilot = () => setIsCopilotOpen(true);
    window.addEventListener('siep_open_activity_drawer', handleOpenNotifs);
    window.addEventListener('siep_open_notifications', handleOpenNotifs);
    window.addEventListener('siep_open_copilot', handleOpenCopilot);
    window.addEventListener('siep_notifications_updated', handleNotifsUpdated);
    window.addEventListener('storage', handleNotifsUpdated);
    return () => {
      window.removeEventListener('siep_open_activity_drawer', handleOpenNotifs);
      window.removeEventListener('siep_open_notifications', handleOpenNotifs);
      window.removeEventListener('siep_open_copilot', handleOpenCopilot);
      window.removeEventListener('siep_notifications_updated', handleNotifsUpdated);
      window.removeEventListener('storage', handleNotifsUpdated);
    };
  }, [user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateTabFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') || 'dashboard';
      setCurrentTab(tab);
    };
    updateTabFromUrl();
    window.addEventListener('popstate', updateTabFromUrl);
    return () => window.removeEventListener('popstate', updateTabFromUrl);
  }, [pathname]);

  const handleNavClick = (tabId?: string) => {
    closeMenu();
    if (tabId) {
      setCurrentTab(tabId);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('siep_tab_change', { detail: tabId }));
      }
    }
  };

  const isDashboard = pathname === '/dashboard';
  const isLog = pathname.startsWith('/log');

  const isDashboardActive = isDashboard && (currentTab === 'dashboard' || !currentTab);
  const isTasksActive = isDashboard && (currentTab === 'team_tasks' || currentTab === 'my_tasks' || currentTab === 'kanban' || currentTab === 'tasks');
  const isTeamTasksActive = isTasksActive;
  const isBuildLogActive = isLog || (isDashboard && currentTab === 'build_log');
  const isTeamsActive = isDashboard && currentTab === 'teams';
  const isReportsActive = isDashboard && (currentTab === 'metrics' || currentTab === 'reports');
  const isMaterialsActive = isDashboard && currentTab === 'materials';
  const isRolesActive = isDashboard && currentTab === 'roles';
  const isAssignedActive = isDashboard && currentTab === 'my_tasks';
  const isProfileActive = isDashboard && currentTab === 'profile';
  const isParth = isParthMasterAdmin(user?.email);

  // User Dropdown State for Desktop Nav
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  useEffect(() => {
    if (!isUserDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#user-nav-dropdown-container')) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isUserDropdownOpen]);

  // Close mobile menu on route change
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setIsMobileMenuOpen(false);
  }

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on Escape key press
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const toggleMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMobileMenuOpen(false);

  if (pathname === '/login') {
    return null;
  }

  return (
    <>
      {/* Top Nav Bar — always visible */}
      <nav className="fixed top-0 left-0 w-full z-[100] bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs pointer-events-auto font-sans transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-2.5 flex justify-between items-center w-full">
          {/* Brand Logo & Portal Tag */}
          <div className="flex items-center gap-3">
            <Link 
              href={isPortalPage ? "/dashboard" : "/"} 
              onClick={closeMenu}
              className="text-2xl font-black text-slate-900 tracking-tight hover:opacity-90 transition-opacity flex items-center"
            >
              Riders Bay<span className="text-orange-500">.</span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {!isMounted ? (
              <div className="w-48 h-9"></div>
            ) : isPortalPage && user ? (
              <DesktopPortalNav
                pathname={pathname}
                currentTab={currentTab}
                handleNavClick={handleNavClick}
                user={user}
                isCore={isCore}
                isLead={isLead}
                isAdmin={isAdmin}
                isParth={isParth}
                currentTeam={currentTeam}
                isDashboardActive={isDashboardActive}
                isTasksActive={isTasksActive}
                isBuildLogActive={isBuildLogActive}
                isTeamsActive={isTeamsActive}
                isReportsActive={isReportsActive}
                isMaterialsActive={isMaterialsActive}
                isRolesActive={isRolesActive}
                deckNotificationsCount={deckNotificationsCount}
                isUserDropdownOpen={isUserDropdownOpen}
                setIsUserDropdownOpen={setIsUserDropdownOpen}
                onOpenCopilot={() => setIsCopilotOpen(true)}
                onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
                onLogout={logout}
              />
            ) : (
              <DesktopPublicNav
                pathname={pathname}
                user={user}
                isInstalled={isInstalled}
                installApp={installApp}
                onLogout={logout}
              />
            )}
          </div>

          {/* Mobile Header Actions & Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <button
                type="button"
                onClick={() => setIsNotificationDrawerOpen(true)}
                title="Personal Deck Alerts"
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-2xs relative"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {deckNotificationsCount > 0 && (
                  <span className="min-w-4 h-4 px-1 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center absolute -top-1 -right-1 ring-2 ring-white">
                    {deckNotificationsCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={toggleMenu}
              className="w-10 h-10 rounded-xl bg-zinc-100/90 hover:bg-zinc-200 text-jet-black focus:outline-none flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-2xs"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Slide-over Mobile Navigation Drawer */}
      <MobileSlideDrawer
        isOpen={isMobileMenuOpen}
        onClose={closeMenu}
        user={user}
        isCore={isCore}
        isLead={isLead}
        isParth={isParth}
        currentTeam={currentTeam}
        isPortalPage={isPortalPage}
        pathname={pathname}
        isDashboardActive={isDashboardActive}
        isTeamTasksActive={isTeamTasksActive}
        isBuildLogActive={isBuildLogActive}
        isAssignedActive={isAssignedActive}
        isMaterialsActive={isMaterialsActive}
        isRolesActive={isRolesActive}
        isProfileActive={isProfileActive}
        deckNotificationsCount={deckNotificationsCount}
        isInstalled={isInstalled}
        installApp={installApp}
        handleNavClick={handleNavClick}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        onLogout={logout}
      />

      {/* Global Instagram-Style Bottom Navigation Bar (Standalone PWA only) */}
      <GlobalMobileBottomBar
        isMounted={isMounted}
        isStandalone={isStandalone}
        pathname={pathname}
        user={user}
        isCore={isCore}
        isLead={isLead}
      />

      {/* Personal Deck & Squad Notifications Drawer */}
      {user && (
        <NotificationDrawer
          isOpen={isNotificationDrawerOpen}
          onClose={() => setIsNotificationDrawerOpen(false)}
          user={user}
          tasks={deckTasks}
          materials={deckMaterials}
        />
      )}

      {/* Official SIEP Rulebook & Engineering Copilot Drawer (Portal Login Only) */}
      {user && (
        <RulebookCopilotDrawer
          isOpen={isCopilotOpen}
          onClose={() => setIsCopilotOpen(false)}
          user={user}
        />
      )}
    </>
  );
}
