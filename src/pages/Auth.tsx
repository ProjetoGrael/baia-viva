import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Waves, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, fullName);
        toast.success("Conta criada! Verifique seu email para confirmar.");
      } else {
        await signIn(email, password);
        toast.success("Bem-vindo ao BaíaViva!");
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro na autenticação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-ocean p-4">
      <Card className="w-full max-w-md shadow-ocean">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Waves className="h-8 w-8 text-primary" />
            <span className="font-heading font-extrabold text-2xl text-foreground">BaíaViva</span>
          </div>
          <CardTitle className="text-lg font-heading">
            {isSignUp ? "Criar Conta" : "Entrar"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? "Junte-se ao monitoramento da Baía de Guanabara"
              : "Acesse sua conta para registrar dados"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <Label>Nome Completo</Label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Seu nome" required />
              </div>
            )}
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
            </div>
            <div>
              <Label>Senha</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Carregando..." : isSignUp ? (
                <><UserPlus className="h-4 w-4 mr-2" /> Criar Conta</>
              ) : (
                <><LogIn className="h-4 w-4 mr-2" /> Entrar</>
              )}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button variant="link" onClick={() => setIsSignUp(!isSignUp)} className="text-sm">
              {isSignUp ? "Já tem conta? Entrar" : "Não tem conta? Criar uma"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
