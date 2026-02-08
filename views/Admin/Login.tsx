import React, { useState } from 'react';
import { Button, Input, Card } from '../../components/UI';
import { supabase } from '../../src/lib/supabase';

export const LoginView: React.FC<{ onLogin: (user: { name: string, role: string } | null) => void; onBack: () => void }> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // The App component will handle the state update via onAuthStateChange, 
        // but we can also pass the user up if needed immediately.
        // For now, let's just wait for the auth listener in App.tsx to pick it up,
        // or trigger the callback if the design relies on it.
        // Actually, the existing design relies on onLogin callback.
        // Let's get the metadata or default profile.

        const metadata = data.user.user_metadata || {};
        const name = metadata.name || email.split('@')[0];
        const role = metadata.role || 'VENDEDOR'; // Default role if not set

        onLogin({ name, role });
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center p-6 bg-primary">
      <Card className="w-full max-w-md p-10 space-y-8 rounded-[40px] shadow-2xl relative">
        <div className="text-center">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"></path></svg>
          </div>
          <h2 className="text-3xl font-black italic uppercase text-primary">Acesso Admin</h2>
          <p className="text-xs text-gray-400 font-bold uppercase mt-2">Área Restrita para Gestores</p>
        </div>

        <div className="space-y-4">
          <Input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          <Input placeholder="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} />

          {error && <div className="text-red-500 text-xs font-bold text-center bg-red-100 p-2 rounded-lg">{error}</div>}

          <Button onClick={handleLogin} variant="secondary" className="w-full py-4 text-xl" disabled={loading}>
            {loading ? 'ENTRANDO...' : 'ENTRAR'}
          </Button>
        </div>

        <button onClick={onBack} className="w-full text-center text-xs font-bold text-gray-400 uppercase underline">Voltar à Loja</button>
      </Card>
    </div>
  );
};
