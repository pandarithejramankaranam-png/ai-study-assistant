import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Folder, BookmarkCheck, User, Sparkles, X } from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'AI Chat Workspace', path: '/chat', icon: MessageSquare, badge: 'AI Tools' },
    { label: 'Study Documents', path: '/documents', icon: Folder },
    { label: 'Saved Notes & Quizzes', path: '/saved-notes', icon: BookmarkCheck },
    { label: 'Profile & Settings', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-[#2D2B2A]/20 backdrop-blur-xs md:hidden"
        ></div>
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-[#FAF8F2] border-r border-[#E8E1D5] p-4 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between md:hidden mb-4 pb-2 border-b border-[#E8E1D5]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#77736B]">Navigation</span>
          <button onClick={onClose} className="p-1 text-[#77736B] hover:text-[#2D2B2A] rounded-xl">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#F5F1E8] text-[#C8A97E] border border-[#E8E1D5] shadow-xs font-bold'
                      : 'text-[#77736B] hover:text-[#2D2B2A] hover:bg-[#F5F1E8]/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#C8A97E] text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Promo Card */}
        <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-[#F5F1E8] border border-[#E8E1D5] text-center">
          <div className="w-8 h-8 rounded-full bg-[#FFFFFF] text-[#C8A97E] border border-[#E8E1D5] flex items-center justify-center mx-auto mb-2 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-[#2D2B2A] mb-0.5">StudyLens AI</p>
          <p className="text-[11px] text-[#77736B] leading-relaxed mb-3">
            Summarize, explain topics & generate MCQs
          </p>
          <NavLink
            to="/chat"
            onClick={onClose}
            className="block text-center text-xs font-bold py-2 px-3 rounded-xl bg-[#C8A97E] hover:bg-[#B8976C] text-white transition shadow-xs"
          >
            Open AI Chat
          </NavLink>
        </div>
      </aside>
    </>
  );
};
