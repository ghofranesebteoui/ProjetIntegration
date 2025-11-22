import { motion } from 'framer-motion';
import { 
  HiAcademicCap, 
  HiQuestionMarkCircle, 
  HiStar,               // ← espace après la virgule
  HiBookOpen, 
  HiUsers, 
  HiChartBar, 
  HiLightningBolt, 
  HiShieldCheck, 
  HiPlay, 
  HiCheckCircle, 
  HiArrowRight 
} from 'react-icons/hi';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const Index = () => {
  const features = [
    {
      icon: HiBookOpen,
      title: "Cours interactifs",
      description: "Plusieurs cours créés par des enseignants passionnés"
    },
    {
      icon: HiUsers,
      title: "Communauté active",
      description: "Échangez avec des enseignants dans une communauté engagée"
    },
    {
      icon: HiChartBar,
      title: "Suivi de progression",
      description: "Visualisez vos progrès et atteignez vos objectifs d'apprentissage"
    },
    {
      icon: HiLightningBolt,
      title: "Apprentissage rapide",
      description: "Des méthodes d'enseignement modernes pour apprendre plus efficacement"
    },
    {
      icon: HiPlay,
      title: "Contenu multimédia",
      description: "Vidéos, quiz, exercices pratiques et ressources téléchargeables"
    }
  ];

  const stats = [
    { value: "100+", label: "Étudiants actifs" },
    { value: "20+", label: "Cours disponibles" },
    { value: "15+", label: "Enseignants experts" },
    { value: "51%", label: "Taux de satisfaction" }
  ];

  const benefits = [
    "Accès illimité à tous les cours",
    "Suivi pédagogique et accompagnement",
    "Espace dédié aux étudiants et formateurs",
    "Apprentissage à votre rythme"
  ];
   const testimonials = [
    {
      name: "Ahmed Ben Ali",
      role: "Étudiant en Informatique",
      text: "EduNova m'a permis de progresser rapidement en développement. Les cours sont clairs et les enseignants très réactifs.",
      avatar: "AB",
    },
    {
      name: "Dr. Nadia Khemiri",
      role: "Enseignante en IA",
      text: "La plateforme est très intuitive. Je peux facilement créer mes contenus et suivre la progression de mes étudiants.",
      avatar: "NK",
    },
    {
      name: "Sarah Trabelsi",
      role: "Étudiante en Design",
      text: "J'aime la flexibilité d'apprendre à mon rythme. EduNova a transformé mon apprentissage.",
      avatar: "ST",
    },
  ]

  const faqs = [
  {
    question: "La plateforme est-elle gratuite ?",
    answer: "Oui, eduNova est 100 % gratuite pour tous les apprenants. Accédez à l’ensemble des cours sans aucun frais.",
  },
  {
    question: "Tous les cours sont-ils accessibles immédiatement ?",
    answer: "Absolument ! Dès votre inscription, vous avez un accès illimité et instantané à tous les cours disponibles.",
  },
  {
    question: "Comment puis-je m’inscrire à un cours ?",
    answer: "Créez un compte, naviguez vers le catalogue des cours et inscrivez-vous avec un seul clic.",
  },
  {
    question: "Les cours sont-ils accessibles hors ligne ?",
    answer: "Vous pouvez télécharger les ressources (PDF, vidéos, exercices) pour les consulter hors ligne.",
  },
];
  return (
    <div className="landing-page">
      {/* HEADER / NAVBAR */}
      <motion.header 
  className="landing-header"
  initial={{ y: -100 }}
  animate={{ y: 0 }}
  transition={{ duration: 0.6 }}
>
  <div className="header-container">
    <div className="header-content">

      {/* LOGO */}
{/* LOGO IDENTIQUE À CELUI DU DASHBOARD */}
<Link to="/" className="logo-landingPage">
  <div className="edunova-icon">
    <HiAcademicCap />
  </div>
  <span className="edunova-text">eduNova</span>
</Link>

{/* NAVIGATION */}
<nav className="header-nav">
  <a href="#features" className="nav-link">Fonctionnalités</a>
  <a href="#testimonials" className="nav-link">Témoignages</a>
  <a href="#faq" className="nav-link">Questions fréquentes</a>
  <a href="#pricing" className="nav-link">Pourquoi nous choisir</a>
  <a href="#stats" className="nav-link">À propos</a>
</nav>

{/* BOUTONS */}
<div className="header-actions">
  <Link to="/login">
    <button className="header-login-btn">Se connecter</button>
  </Link>
</div>
    </div>
  </div>
</motion.header>


      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-grid">
            <motion.div
              className="hero-text"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="hero-badge"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <HiLightningBolt className="badge-icon" />
                <span className="badge-text">Plateforme d'apprentissage nouvelle génération</span>
              </motion.div>

              <h1 className="hero-title">
                Apprenez sans limites avec{' '}
                <span className="hero-title-gradient">eduNova</span>
              </h1>

              <p className="hero-description">
                Rejoignez une communauté d'apprenants et découvrez des cours créés par des enseignants. 
                Développez vos compétences à votre rythme, où que vous soyez.
              </p>

              <div className="hero-buttons">
                <Link to="/login">
                  <button className="btn-hero">
                    Commencer l'apprentissage
                    <HiArrowRight className="btn-icon" />
                  </button>
                </Link>
              </div>

              <div className="hero-trust">
                <div className="trust-avatars">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="trust-avatar">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="trust-text">
                  <p className="trust-count">100+ étudiants</p>
                  <p className="trust-subtext">nous font confiance</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="hero-image-wrapper"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="hero-image-container">
                <img 
                  src="/photo-1.avif"
                  alt="Students learning" 
                  className="hero-image"
                />
                <div className="hero-image-overlay" />
              </div>

              
        
              
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section id="stats" className="stats-section">
        <div className="stats-container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="stat-item"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <h3 className="stat-value">{stat.value}</h3>
                <p className="stat-label">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="features-section">
        <div className="features-container">
          <motion.div
            className="features-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="features-title">
              Tout ce dont vous avez besoin pour réussir
            </h2>
            <p className="features-subtitle">
              Une plateforme complète avec tous les outils pour apprendre efficacement
            </p>
          </motion.div>

          <div className="features-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="feature-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="feature-icon-box">
                    <Icon className="feature-icon" />
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
       {/* TESTIMONIALS */}
      <section id="testimonials" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Ce que disent nos utilisateurs</h2>
            <p className="text-xl text-gray-600">Découvrez les expériences de nos apprenants satisfaits</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <HiStar key={i} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="avatar-circle">
  {testimonial.avatar}
</div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div className="text-center mb-16" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
            <p className="text-xl text-gray-600">Trouvez les réponses à vos questions</p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <motion.details
                key={idx}
                className="group border border-gray-200 rounded-lg p-6 hover:border-violet-600 transition-all cursor-pointer"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <summary className="flex items-center justify-between font-semibold text-gray-900 select-none">
                  <span className="flex items-center gap-3">
                    <HiQuestionMarkCircle className="text-violet-600" />
                    {faq.question}
                  </span>
                </summary>
                <p className="mt-4 text-gray-600 pl-8">{faq.answer}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section id="pricing" className="cta-section">
        <div className="cta-container">
          <motion.div
            className="cta-content"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="cta-title">
              Prêt à transformer votre apprentissage ?
            </h2>
            <p className="cta-subtitle">
              Rejoignez eduNova aujourd'hui et accédez à tous nos cours et fonctionnalités.
            </p>

            <div className="pricing-card">
              <div className="pricing-grid">
                <div className="pricing-benefits">
                  <h3 className="pricing-heading">Pourquoi nous choisir ?</h3>
                  <div className="benefits-list">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="benefit-item">
                        <HiCheckCircle className="benefit-icon" />
                        <span className="benefit-text">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pricing-action">
                  <Link to="/login">
                    <button className="btn-cta">
                      Découvrir la plateforme 
                      <HiArrowRight className="btn-icon" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
  <div className="edunova-icon">
    <HiAcademicCap />
  </div>
  <span className="edunova-text" style={{ 
    background: 'linear-gradient(135deg, #ffffff, #f0f0ff)', 
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  }}>eduNova</span>
</div>
              <p className="footer-tagline">
                La plateforme d'apprentissage en ligne de la nouvelle génération
              </p>
            </div>

            <div className="footer-links">
              <h4 className="footer-heading">Plateforme</h4>
              <ul className="footer-list">
                <li><a href="#" className="footer-link">Cours</a></li>
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
    </div>
  );
};

export default Index;
