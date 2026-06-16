import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import AjoutProduit from "./components/AjoutProduit";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-layout">
        {/* --- BARRE DE NAVIGATION (SIDEBAR OU TOPBAR) --- */}
        <nav className="navbar">
          <div className="nav-logo">
            📦 StockAr
          </div>
          <ul className="nav-links">
            <li>
              {/* NavLink ajoute automatiquement une classe "active" quand la route correspond */}
              <NavLink 
                to="/" 
                className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
              >
                📊 Tableau de bord
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/ajouter" 
                className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
              >
                ➕ Ajouter un produit
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* --- ZONE DE CONTENU DYNAMIQUE --- */}
        <main className="content-area">
          <Routes>
            {/* Route pour le Dashboard (Page d'accueil) */}
            <Route path="/" element={<Dashboard />} />
            
            {/* Route pour le Formulaire d'ajout */}
            <Route path="/ajouter" element={<AjoutProduit />} />
            
            {/* Route de secours (404) si l'utilisateur tape une URL inexistante */}
            <Route path="*" element={
              <div style={{ padding: "40px", textAlign: "center" }}>
                <h2>Page introuvable 404</h2>
                <Link to="/">Retour au Tableau de Bord</Link>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;