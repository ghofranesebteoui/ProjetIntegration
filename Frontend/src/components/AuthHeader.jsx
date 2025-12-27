import { Link } from "react-router-dom";
import { HiAcademicCap } from "react-icons/hi";
import "./AuthHeader.css";

export default function AuthHeader() {
  return (
    <header className="auth-header">
      <div className="auth-header-container">
        <Link to="/" className="auth-logo">
          <div className="edunova-icon">
            <HiAcademicCap />
          </div>
          <span className="edunova-text">eduNova</span>
        </Link>
        
        <nav className="auth-nav">
          <Link to="/" className="auth-nav-link">Accueil</Link>
          <Link to="/login" className="auth-nav-link">Connexion</Link>
        </nav>
      </div>
    </header>
  );
}
