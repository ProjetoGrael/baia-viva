import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Map, ClipboardList, Users, Menu, X, 
  Waves, FileText, ChevronRight, LogOut, User, Shield 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: null },
  { path: "/mapa", label: "Mapa", icon: Map, roles: null },
  { path: "/coleta", label: "Coleta Científica", icon: ClipboardList, roles: ["admin", "professor", "student"] as const },
  { path: "/comunidade", label: "Comunidade", icon: Users, roles: null },
  { path: "/dados", label: "Dados & Exportação", icon: FileText, roles: ["admin", "professor", "student"] as const },
  { path: "/admin", label: "Administração", icon: Shield, roles: ["admin"] as const },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { profile, role, signOut } = useAuth();

  const visibleItems = NAV_ITEMS.filter(item => 
    !item.roles || (role && (item.roles as readonly string[]).includes(role))
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Mobile header */}
      <header className="lg:hidden gradient-ocean flex items-center justify-between px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Waves className="h-6 w-6 text-primary-foreground" />
          <span className="font-heading font-bold text-primary-foreground text-lg">BaíaViva</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground hover:bg-primary-foreground/10"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 gradient-ocean transform transition-transform duration-300 lg:translate-x-0 lg:static lg:min-h-screen",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="hidden lg:flex items-center gap-3 px-6 py-6">
          <Waves className="h-8 w-8 text-primary-foreground animate-wave" />
          <div>
            <h1 className="font-heading font-extrabold text-primary-foreground text-xl tracking-tight">BaíaViva</h1>
            <p className="text-primary-foreground/60 text-xs">Monitoramento Ambiental</p>
          </div>
        </div>

        <nav className="mt-4 lg:mt-2 px-3 space-y-1">
          {visibleItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary-foreground/15 text-primary-foreground"
                    : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-0 right-0 px-4 space-y-3">
          {/* User info */}
          <div className="bg-primary-foreground/10 rounded-lg p-3 flex items-center gap-3">
            <User className="h-5 w-5 text-primary-foreground/70 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-primary-foreground text-sm font-medium truncate">
                {profile?.full_name || "Usuário"}
              </p>
              <p className="text-primary-foreground/50 text-[11px] capitalize">{role || "comunidade"}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
