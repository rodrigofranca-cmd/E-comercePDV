
import React, { useState, useEffect } from 'react';
import { supabase } from './src/lib/supabase';
import { useAppState } from './store';
import { HomeView } from './views/Storefront/Home';
import { AdminView } from './views/Admin/AdminDashboard';
import { LoginView } from './views/Admin/Login';
import { CartView } from './views/Storefront/Cart';

const App: React.FC = () => {
  const [view, setView] = useState<'store' | 'admin' | 'login' | 'cart'>('store');
  const [loggedUser, setLoggedUser] = useState<{ name: string, role: string } | null>(null);
  const state = useAppState();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        const name = metadata.name || session.user.email?.split('@')[0] || 'Usuário';
        const role = metadata.role || 'VENDEDOR';
        setLoggedUser({ name, role });
      }
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        const name = metadata.name || session.user.email?.split('@')[0] || 'Usuário';
        const role = metadata.role || 'VENDEDOR';
        setLoggedUser({ name, role });
      } else {
        setLoggedUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const navigateTo = (newView: 'store' | 'admin' | 'login' | 'cart') => {
    if (newView === 'admin' && !loggedUser) {
      setView('login');
    } else {
      setView(newView);
    }
  };

  const handleLogin = (user: { name: string, role: string } | null) => {
    if (user) {
      setLoggedUser(user);
      setView('admin');
    }
  };

  return (
    <div className="min-h-screen max-w-[500px] mx-auto bg-slate-50 relative overflow-hidden shadow-2xl">
      {view === 'store' && <HomeView state={state} onNavigate={navigateTo} />}
      {view === 'cart' && <CartView state={state} onBack={() => setView('store')} />}
      {view === 'login' && <LoginView onLogin={handleLogin} onBack={() => setView('store')} />}
      {view === 'admin' && loggedUser && <AdminView state={state} user={loggedUser} onLogout={() => { supabase.auth.signOut(); setLoggedUser(null); setView('store'); }} onBack={() => setView('store')} />}

      {/* Persistent App Header Styling Hook (Dynamic Colors) */}
      <style>{`
        :root {
          --color-primary: ${state.config.colors.menus};
          --color-secondary: ${state.config.colors.buttons};
          --color-promo: ${state.config.colors.promotions};
        }
        .bg-primary { background-color: var(--color-primary); }
        .bg-secondary { background-color: var(--color-secondary); }
        .bg-promo { background-color: var(--color-promo); }
        
        .text-primary { color: var(--color-primary); }
        .text-secondary { color: var(--color-secondary); }
        .text-promo { color: var(--color-promo); }

        .border-primary { border-color: var(--color-primary); }
        .border-secondary { border-color: var(--color-secondary); }
        .border-promo { border-color: var(--color-promo); }

        .focus-ring-primary:focus { --tw-ring-color: var(--color-primary); }
        .focus-ring-secondary:focus { --tw-ring-color: var(--color-secondary); }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
