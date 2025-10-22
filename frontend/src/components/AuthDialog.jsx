import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2 } from 'lucide-react';

const AuthDialog = ({ open, onOpenChange }) => {
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup form
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    faculty: '',
    year_of_study: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await signIn(loginEmail, loginPassword);
    
    setLoading(false);
    if (result.success) {
      onOpenChange(false);
      setLoginEmail('');
      setLoginPassword('');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (signupData.password.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    if (!signupData.name || !signupData.email) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    setLoading(true);
    
    const userData = {
      name: signupData.name,
      email: signupData.email,
      password: signupData.password,
      department: signupData.department || null,
      faculty: signupData.faculty || null,
      year_of_study: signupData.year_of_study || null
    };
    
    const result = await signUp(userData);
    
    setLoading(false);
    if (result.success) {
      onOpenChange(false);
      setSignupData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        department: '',
        faculty: '',
        year_of_study: ''
      });
    }
  };

  const updateSignupData = (field, value) => {
    setSignupData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Bienvenue sur UnivLoop</DialogTitle>
          <DialogDescription>
            Connectez-vous ou créez un compte pour rejoindre la boucle universitaire
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Connexion</TabsTrigger>
            <TabsTrigger value="signup">Inscription</TabsTrigger>
          </TabsList>
          
          {/* Login Tab */}
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="votre@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password">Mot de passe</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>
          </TabsContent>
          
          {/* Signup Tab */}
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Nom complet *</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Jean Dupont"
                  value={signupData.name}
                  onChange={(e) => updateSignupData('name', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email *</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="votre@email.com"
                  value={signupData.email}
                  onChange={(e) => updateSignupData('email', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-department">Département</Label>
                <Input
                  id="signup-department"
                  type="text"
                  placeholder="Ex: Informatique, Médecine, Droit..."
                  value={signupData.department}
                  onChange={(e) => updateSignupData('department', e.target.value)}
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-faculty">Faculté</Label>
                <Input
                  id="signup-faculty"
                  type="text"
                  placeholder="Ex: Sciences, Médecine, Lettres..."
                  value={signupData.faculty}
                  onChange={(e) => updateSignupData('faculty', e.target.value)}
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-year">Année d'études</Label>
                <Select 
                  value={signupData.year_of_study} 
                  onValueChange={(value) => updateSignupData('year_of_study', value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez votre année" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L1">Licence 1</SelectItem>
                    <SelectItem value="L2">Licence 2</SelectItem>
                    <SelectItem value="L3">Licence 3</SelectItem>
                    <SelectItem value="M1">Master 1</SelectItem>
                    <SelectItem value="M2">Master 2</SelectItem>
                    <SelectItem value="Doctorat">Doctorat</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-password">Mot de passe *</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Au moins 6 caractères"
                  value={signupData.password}
                  onChange={(e) => updateSignupData('password', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password">Confirmer le mot de passe *</Label>
                <Input
                  id="signup-confirm-password"
                  type="password"
                  placeholder="Retapez votre mot de passe"
                  value={signupData.confirmPassword}
                  onChange={(e) => updateSignupData('confirmPassword', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création du compte...
                  </>
                ) : (
                  'Créer un compte'
                )}
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                * Champs obligatoires
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
