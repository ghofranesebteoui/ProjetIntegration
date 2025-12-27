import { HiAcademicCap } from "react-icons/hi";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="edunova-icon">
                <HiAcademicCap />
              </div>
              <span className="edunova-text">eduNova</span>
            </div>
            <p className="footer-tagline">
              La plateforme d'apprentissage en ligne de la nouvelle génération
            </p>
          </div>

          <div className="footer-links">
            <h4 className="footer-heading">Plateforme</h4>
            <ul className="footer-list">
              <li><a href="/courses" className="footer-link">Cours</a></li>
              <li><a href="#" className="footer-link">Enseignants</a></li>
              <li><a href="#" className="footer-link">Étudiants</a></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4 className="footer-heading">Entreprise</h4>
            <ul className="footer-list">
              <li><a href="#" className="footer-link">À propos</a></li>
              <li><a href="#" className="footer-link">Blog</a></li>
              <li><a href="#" className="footer-link">Carrières</a></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-list">
              <li><a href="#" className="footer-link">Centre d'aide</a></li>
              <li><a href="#" className="footer-link">Contact</a></li>
              <li><a href="#" className="footer-link">CGU</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 eduNova. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
