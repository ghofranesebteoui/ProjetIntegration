import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { HiAcademicCap } from 'react-icons/hi';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../authGoogle';
import Swal from 'sweetalert2';

const LoginPage = ({ setUser }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  // États séparés pour les deux formulaires
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [showPasswordSignup, setShowPasswordSignup] = useState(false);

  const navigate = useNavigate();

  // Redirection selon le rôle
  const redirectToDashboard = (role) => {
    if (role === 'admin') navigate('/admin');
    else if (role === 'enseignant') navigate('/enseignant');
    else if (role === 'etudiant') navigate('/etudiant');
    else navigate('/etudiant'); // par défaut
  };

  // Renvoyer l'email de vérification
  const handleResendVerification = async () => {
    const email = document.querySelector('input[name="email"]')?.value?.trim();
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

    const formData = new FormData(e.target);
    const credentials = {
      email: formData.get('email')?.trim(),
      password: formData.get('password'),
    };

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', credentials);

      // CORRECTION PRINCIPALE : .data.data (pas .data.data.data)
      const { token, user } = res.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      redirectToDashboard(user.role);
    } catch (err) {
      if (err.response?.data?.needsVerification) {
        setError(
          <div style={{ textAlign: 'center' }}>
            {err.response.data.error || "Veuillez vérifier votre email avant de vous connecter."}
            <button
              type="button"
              onClick={handleResendVerification}
              style={{
                marginLeft: '10px',
                background: 'none',
                border: 'none',
                color: '#7c3aed',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Renvoyer l'email
            </button>
          </div>
        );
      } else {
        setError(err.response?.data?.error || 'Email ou mot de passe incorrect');
      }
    }
  };

  // Inscription
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.target);
    const data = {
      first_name: formData.get('first_name')?.trim(),
      last_name: formData.get('last_name')?.trim(),
      email: formData.get('email')?.trim(),
      password: formData.get('password'),
      role: formData.get('role'),
    };

    if (data.password !== formData.get('confirm_password')) {
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
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'inscription");
    }
  };

  return (
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
    {typeof error === 'string' ? error : error}
  </div>
)}
              <form onSubmit={handleLogin}>
                <input type="email" name="email" placeholder="Email" required autoFocus />

                <div className="input-group">
                  <label>Mot de passe</label>
                  <div className="password-wrapper">
                    <input
                      type={showPasswordLogin ? 'text' : 'password'}
                      name="password"
                      placeholder="Votre mot de passe"
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPasswordLogin(!showPasswordLogin)}
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

                <button type="submit" className="btn-primary">
                  Se connecter
                </button>
              </form>

              <div className="divider">ou</div>

              <button onClick={handleGoogleLogin} className="btn-google">
                <FcGoogle size={22} /> Continuer avec Google
              </button>

              <p className="switch-text">
                Pas encore de compte ?{' '}
                <span
                  onClick={() => {
                    setIsSignUp(true);
                    setError('');
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
    {typeof error === 'string' ? error : error}
  </div>
)}
              <form onSubmit={handleRegister}>
                <div className="name-row">
                  <input type="text" name="first_name" placeholder="Prénom" required />
                  <input type="text" name="last_name" placeholder="Nom" required />
                </div>

                <input type="email" name="email" placeholder="Email" required />

                <div className="input-group">
                  <label>Mot de passe</label>
                  <div className="password-wrapper">
                    <input
                      type={showPasswordSignup ? 'text' : 'password'}
                      name="password"
                      placeholder="Minimum 6 caractères"
                      minLength="6"
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPasswordSignup(!showPasswordSignup)}
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
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPasswordSignup(!showPasswordSignup)}
                    >
                      {showPasswordSignup ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <select name="role" required defaultValue="">
                  <option value="" disabled>Choisir votre rôle</option>
                  <option value="etudiant">Étudiant</option>
                  <option value="enseignant">Enseignant</option>
                </select>

                <button type="submit" className="btn-primary">
                  S'inscrire
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
  );
};

export default LoginPage;