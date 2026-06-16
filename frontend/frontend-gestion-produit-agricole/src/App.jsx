import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import AjoutProduit from "./components/AjoutProduit";
import MouvementStock from "./components/MouvementStock";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-layout">
        
        {/* --- SIDEBAR DESIGN MODERNE --- */}
        <nav className="sidebar">
          <div className="sidebar-header">
            <div className="nav-logo">
              <span className="logo-icon">📦</span>
              <span className="logo-text">Gestion Stock<span className="accent-text"> Agricole</span></span>
            </div>
          </div>
          
          <div className="sidebar-menu">
            <span className="menu-divider">Navigation</span>
            <ul className="nav-links">
              <li>
                <NavLink 
                  to="/" 
                  className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                >
                  <span className="item-icon">📊</span>
                  <span className="item-text">Dashboard</span>
                </NavLink>
              </li>

              <li>
                <NavLink 
                  to="/ajouter" 
                  className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                >
                  <span className="item-icon">➕</span>
                  <span className="item-text">Ajouter produit</span>
                </NavLink>
              </li>

              <li>
                <NavLink to="/mouvement" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                  <span className="item-icon">🔄</span>
                  <span className="item-text">Mouvements Stock</span>
                </NavLink>
              </li>
            </ul>
          </div>
          
          {/* Footer de la sidebar optionnel pour le style */}
          <div className="sidebar-footer">
            <p>v1.0.0 — MERN Stack</p>
          </div>
        </nav>

        {/* --- ZONE DE CONTENU PRINCIPALE --- */}
        <main className="content-area">
          <div className="content-card-wrapper">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/ajouter" element={<AjoutProduit />} />
              <Route path="*" element={
                <div className="error-404">
                  <h2>Page introuvable 404</h2>
                  <p>La page que vous recherchez n'existe pas.</p>
                  <Link to="/" className="btn-back">Retour au Tableau de Bord</Link>
                </div>
              } />
              <Route path="/mouvement" element={<MouvementStock />} />
            </Routes>
          </div>
        </main>

      </div>
    </Router>
  );
}

export default App;