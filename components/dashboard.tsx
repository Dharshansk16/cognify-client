"use client";

import { useState } from "react";
import {
  Menu,
  LogOut,
  Settings,
  Home,
  Zap,
  FileText,
  MessageSquare,
} from "lucide-react";
import { removeToken } from "@/lib/api";
import PersonaCreation from "./persona-creation";
import PersonaTraining from "./persona-training";
import ChatInterface from "./chat-interface";

interface DashboardProps {
  onLogout: () => void;
}

type Page = "home" | "personas" | "training" | "chat";

export default function Dashboard({ onLogout }: DashboardProps) {
  const [currentPage, setCurrentPage] = useState<Page>("personas");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    removeToken();
    onLogout();
  };

  const menuItems = [
    { id: "home", label: "Dashboard", icon: Home },
    { id: "personas", label: "Personas", icon: Zap },
    { id: "training", label: "Training", icon: FileText },
    { id: "chat", label: "Chats", icon: MessageSquare },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case "personas":
        return <PersonaCreation />;
      case "training":
        return <PersonaTraining />;
      case "chat":
        return <ChatInterface />;
      default:
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white text-balance">
                Welcome to Cognify
              </h1>
              <p className="text-muted-foreground text-lg">
                Create AI personas, train them with your data, and chat
                naturally
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => setCurrentPage("personas")}
                className="glassmorphic p-6 text-left hover:bg-white/10 transition-all duration-200 group"
              >
                <Zap className="w-12 h-12 text-accent mb-4" />
                <h3 className="font-semibold text-white text-lg mb-2 group-hover:text-accent transition-colors">
                  Create Personas
                </h3>
                <p className="text-sm text-muted-foreground">
                  Build custom AI personalities tailored to your needs
                </p>
              </button>
              <button
                onClick={() => setCurrentPage("training")}
                className="glassmorphic p-6 text-left hover:bg-white/10 transition-all duration-200 group"
              >
                <FileText className="w-12 h-12 text-accent mb-4" />
                <h3 className="font-semibold text-white text-lg mb-2 group-hover:text-accent transition-colors">
                  Train with Data
                </h3>
                <p className="text-sm text-muted-foreground">
                  Upload documents to enhance your persona's knowledge
                </p>
              </button>
              <button
                onClick={() => setCurrentPage("chat")}
                className="glassmorphic p-6 text-left hover:bg-white/10 transition-all duration-200 group"
              >
                <MessageSquare className="w-12 h-12 text-accent mb-4" />
                <h3 className="font-semibold text-white text-lg mb-2 group-hover:text-accent transition-colors">
                  Start Chatting
                </h3>
                <p className="text-sm text-muted-foreground">
                  Have natural conversations with your trained personas
                </p>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`glassmorphic fixed md:relative transition-all duration-300 h-full z-40 ${
          sidebarOpen ? "w-64" : "w-0 md:w-20"
        } border-r border-white/10 overflow-hidden`}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <span className="font-bold text-white text-lg">Persona AI</span>
            )}
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id as Page);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  currentPage === item.id
                    ? "bg-gradient-to-r from-purple-600/50 to-blue-600/50 text-white border border-accent/50"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2 border-t border-white/10">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-all duration-200">
            <Settings className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && (
              <span className="text-sm font-medium">Settings</span>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <div className="h-16 glassmorphic border-b border-white/10 px-6 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-white hover:text-accent transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold cursor-pointer hover:shadow-lg hover:shadow-purple-500/50 transition-all">
              U
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 md:p-8">{renderPage()}</div>
        </div>
      </div>
    </div>
  );
}
