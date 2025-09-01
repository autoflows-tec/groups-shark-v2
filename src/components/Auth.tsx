import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import SharkLogo from './SharkLogo';
import { Loader2, Mail, Lock } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha.",
        variant: "destructive",
      });
      return;
    }

    if (isSignUp && !fullName) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, preencha seu nome completo.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });

        if (error) throw error;

        if (data?.user && !data?.session) {
          toast({
            title: "Verifique seu email",
            description: "Enviamos um link de confirmação para seu email.",
          });
        } else {
          toast({
            title: "Conta criada!",
            description: "Bem-vindo ao sistema.",
          });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Login realizado!",
          description: "Bem-vindo de volta ao sistema.",
        });
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: "Erro na autenticação",
        description: error.message || "Não foi possível realizar a operação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-shark-dark-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-shark-dark-card border-2 border-shark-primary shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <SharkLogo className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl font-poppins font-bold text-shark-dark dark:text-white">
            {isSignUp ? 'Criar Conta' : 'Entrar'}
          </CardTitle>
          <p className="text-sm text-shark-gray dark:text-gray-300 font-inter">
            {isSignUp 
              ? 'Crie sua conta para acessar o painel de grupos'
              : 'Entre com suas credenciais para acessar o sistema'
            }
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium text-shark-dark dark:text-white font-inter">
                  Nome Completo
                </label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Seu nome completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="font-inter"
                  disabled={loading}
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-shark-dark dark:text-white font-inter">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-shark-gray" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 font-inter"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-shark-dark dark:text-white font-inter">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-shark-gray" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 font-inter"
                  disabled={loading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-shark-primary hover:bg-shark-primary/90 text-white font-inter font-medium"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading 
                ? (isSignUp ? 'Criando conta...' : 'Entrando...') 
                : (isSignUp ? 'Criar Conta' : 'Entrar')
              }
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setEmail('');
                  setPassword('');
                  setFullName('');
                }}
                disabled={loading}
                className="text-shark-primary hover:text-shark-primary/80 font-inter"
              >
                {isSignUp 
                  ? 'Já tem uma conta? Faça login' 
                  : 'Não tem conta? Cadastre-se'
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}