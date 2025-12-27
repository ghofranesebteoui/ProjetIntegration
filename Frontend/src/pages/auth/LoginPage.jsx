import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { HiAcademicCap } from 'react-icons/hi';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../../authGoogle';
import Swal from 'sweetalert2';
import AuthHeader from '../../components/AuthHeader';
import Footer from '../../components/Footer';

const LoginPage = ({ setUser }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  // États séparés pour les deux formulaires
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [showPasswordSignup, setShowPasswordSignup] = useState(false);

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirection selon le rôle
  const redirectToDashboard = (role) => {
    if (role === 'admin') navigate('/admin');
    else if (role === 'enseignant' || role === 'teacher') navigate('/teacher-dashboard');
    else if (role === 'etudiant' || role === 'student') navigate('/student-dashboard');
    else navigate('/student-dashboard'); // par défaut
  };

  // Renvoyer l'email de vérification
  const handleResendVerification = async () => {
    if (!email) return setError("Veuillez entrer votre email d'abord.");

    try {
      await axios.post('http://localhost:5000/api/auth/resend-verification', { email });
      setError('Email de vérification renvoyé ! Vérifiez votre boîte de réception.');
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors du renvoi de l'email");
    }
  };

  // Connexion avec Google
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const googleData = {
        email: user.email,
        first_name: user.displayName?.split(' ')[0] || '',
        last_name: user.displayName?.split(' ').slice(1).join(' ') || '',
        uid: user.uid,
      };

      const res = await axios.post('http://localhost:5000/api/auth/google-login', googleData);
      const { token, user: userData } = res.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      redirectToDashboard(userData.role);
    } catch (error) {
      console.error('Erreur Google login:', error);
      setError('Erreur lors de la connexion avec Google.');
    }
  };

  // Connexion classique
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      console.log('📦 Réponse complète du serveur:', data);

      if (response.ok && data.success) {
        console.log('✅ Login réussi');
        console.log('🎫 Token reçu:', data.token?.substring(0, 30) + '...');
        console.log('👤 User reçu:', data.user);
        console.log('🎭 Role:', data.user.role);

        // ✅ Vérifier que le token contient bien le role
        if (data.token) {
          const tokenPayload = JSON.parse(atob(data.token.split('.')[1]));
          console.log('📦 Payload du token:', tokenPayload);
          
          if (!tokenPayload.role) {
            console.error('❌ ERREUR : Le token ne contient pas de role !');
            setError('Erreur serveur : token invalide');
            setLoading(false);
            return;
          }
        }

        // Stocker le token
        localStorage.setItem('token', data.token);
        
        // Stocker les infos utilisateur
        const userData = {
          id: data.user.id,
          email: data.user.email,
          first_name: data.user.first_name,
          last_name: data.user.last_name,
          role: data.user.role,
          token: data.token
        };

        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        console.log('✅ Token et user stockés dans localStorage');
        
        // Redirection selon le rôle
        redirectToDashboard(data.user.role);
      } else {
        console.error('❌ Échec login:', data.error || data.message);
        setError(data.error || data.message || 'Erreur de connexion');
      }
    } catch (err) {
      console.error('❌ Erreur réseau:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Inscription
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.target);
    const data = {
      first_name: formData.get('first_name')?.trim(),
      last_name: formData.get('last_name')?.trim(),
      email: formData.get('email')?.trim(),
      password: formData.get('password'),
      role: formData.get('role'),
    };

    if (data.password !== formData.get('confirm_password')) {
      setLoading(false);
      return setError('Les mots de passe ne correspondent pas');
    }

    try {
      await axios.post('http://localhost:5000/api/auth/register', data);
      Swal.fire({
        icon: 'success',
        title: 'Inscription réussie !',
        text: 'Un email de vérification vous a été envoyé.',
        confirmButtonColor: '#7c3aed',
      });
      setIsSignUp(false);
      setError('');
      // Réinitialiser le formulaire
      e.target.reset();
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthHeader />
      <div className="login-wrapper">
        <AnimatePresence mode="wait">
        {/* ==================== CONNEXION ==================== */}
        {!isSignUp ? (
          <motion.div
            key="login"
            className="login-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="form-card"
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <Link to="/" className="logo-link">
                <div className="logo">
                  <HiAcademicCap className="logo-icon" />
                  <h1>eduNova</h1>
                </div>
              </Link>

              <h2>Bienvenue !</h2>
              <p className="subtitle">Connectez-vous pour continuer votre apprentissage</p>

              {error && (
                <div className="error">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="input-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="Email" 
                    required 
                    autoFocus 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="input-group">
                  <label>Mot de passe</label>
                  <div className="password-wrapper">
                    <input
                      type={showPasswordLogin ? 'text' : 'password'}
                      name="password"
                      placeholder="Votre mot de passe"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPasswordLogin(!showPasswordLogin)}
                      disabled={loading}
                    >
                      {showPasswordLogin ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="options">
                  <Link to="/forget-password" className="link">
                    Mot de passe oublié ?
                  </Link>
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Connexion en cours...' : 'Se connecter'}
                </button>
              </form>

              <div className="divider">ou</div>

              <button onClick={handleGoogleLogin} className="btn-google" disabled={loading}>
                <FcGoogle size={22} /> Continuer avec Google
              </button>

              <p className="switch-text">
                Pas encore de compte ?{' '}
                <span
                  onClick={() => {
                    setIsSignUp(true);
                    setError('');
                    setEmail('');
                    setPassword('');
                  }}
                  className="switch-link"
                >
                  S'inscrire
                </span>
              </p>
            </motion.div>

            {/* Hero côté droit */}
            <motion.div
              className="hero-side"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            >
              <div className="hero-content">
                <HiAcademicCap className="big-icon" />
                <h1>Reprenez là où vous vous êtes arrêté</h1>
                <p>Divers cours, une communauté active, et un apprentissage moderne.</p>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          /* ==================== INSCRIPTION ==================== */
          <motion.div
            key="signup"
            className="login-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="hero-side"
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <div className="hero-content">
                <HiAcademicCap className="big-icon" />
                <h1>Rejoignez eduNova aujourd'hui</h1>
                <p>Créez votre compte en quelques secondes.</p>
              </div>
            </motion.div>

            <motion.div
              className="form-card"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            >
              <Link to="/" className="logo-link">
                <div className="logo">
                  <HiAcademicCap className="logo-icon" />
                  <h1>eduNova</h1>
                </div>
              </Link>

              <h2>Créer un compte</h2>

              {error && (
                <div className="error">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister}>
                <div className="name-row">
                  <input 
                    type="text" 
                    name="first_name" 
                    placeholder="Prénom" 
                    required 
                    disabled={loading}
                  />
                  <input 
                    type="text" 
                    name="last_name" 
                    placeholder="Nom" 
                    required 
                    disabled={loading}
                  />
                </div>

                <div className="input-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="Email" 
                    required 
                    disabled={loading}
                  />
                </div>

                <div className="input-group">
                  <label>Mot de passe</label>
                  <div className="password-wrapper">
                    <input
                      type={showPasswordSignup ? 'text' : 'password'}
                      name="password"
                      placeholder="Minimum 6 caractères"
                      minLength="6"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPasswordSignup(!showPasswordSignup)}
                      disabled={loading}
                    >
                      {showPasswordSignup ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <label>Confirmer le mot de passe</label>
                  <div className="password-wrapper">
                    <input
                      type={showPasswordSignup ? 'text' : 'password'}
                      name="confirm_password"
                      placeholder="Confirmez votre mot de passe"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPasswordSignup(!showPasswordSignup)}
                      disabled={loading}
                    >
                      {showPasswordSignup ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <select name="role" required defaultValue="" disabled={loading}>
                  <option value="" disabled>Choisir votre rôle</option>
                  <option value="etudiant">Étudiant</option>
                  <option value="enseignant">Enseignant</option>
                </select>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Inscription en cours...' : 'S\'inscrire'}
                </button>
              </form>

              <p className="switch-text">
                Déjà un compte ?{' '}
                <span
                  onClick={() => {
                    setIsSignUp(false);
                    setError('');
                  }}
                  className="switch-link"
                >
                  Se connecter
                </span>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    <Footer />
    </>
  );
};

export default LoginPage;