import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/Dashboard.css";

const Dashboard = () => {
  // 1. États pour les données et le chargement
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState("");

  // 2. États pour les filtres et le tri
  const [filterNom, setFilterNom] = useState("");
  const [filterQuantiteMin, setFilterQuantiteMin] = useState("");
  const [filterQuantiteMax, setFilterQuantiteMax] = useState("");
  const [sortBy, setSortBy] = useState("az"); // Options: "az" ou "qty_asc"

  // Récupération des données depuis l'API Express
  useEffect(() => {
    fetchProduits();
  }, []);

  const fetchProduits = async () => {
    setLoading(true);
    setBackendError("");
    try {
      const response = await axios.get("http://localhost:3000/api/produits");
      setProduits(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setBackendError(error.response.data.message);
      } else {
        setBackendError("Impossible de charger les données du tableau de bord.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 3. Logique de filtrage ET de tri (Côté Client)
  const produitsTraites = produits
    .filter((produit) => {
      // Filtre par nom
      const matchNom = produit.nom.toLowerCase().includes(filterNom.toLowerCase());
      
      // Filtre par quantité minimale
      const matchMin = filterQuantiteMin === "" || produit.quantite >= Number(filterQuantiteMin);
      
      // Filtre par quantité maximale
      const matchMax = filterQuantiteMax === "" || produit.quantite <= Number(filterQuantiteMax);

      return matchNom && matchMin && matchMax;
    })
    .sort((a, b) => {
      // Logique de tri selon l'option sélectionnée
      if (sortBy === "az") {
        return a.nom.localeCompare(b.nom);
      } else if (sortBy === "qty_asc") {
        return a.quantite - b.quantite;
      }
      return 0;
    });

  // 4. Calculs des indicateurs financiers (KPIs sur l'ensemble du stock brut)
  const totalProduits = produits.length;
  
  const chiffreAffaireGlobal = produits.reduce((total, produit) => {
    const prixProduit = produit.prix || 0;
    const quantiteProduit = produit.quantite || 0;
    return total + (prixProduit * quantiteProduit);
  }, 0);

  if (loading) {
    return <div className="dashboard-loading">Chargement du tableau de bord...</div>;
  }

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Tableau de Bord des Stocks</h2>

      {backendError && <div className="alert alert-danger">{backendError}</div>}

      {/* --- SECTION DES BLOCS KPI --- */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-info">
            <span className="kpi-label">Nombre de Références</span>
            <span className="kpi-value">{totalProduits}</span>
          </div>
          <div className="kpi-icon icon-box">📦</div>
        </div>

        <div className="kpi-card kpi-ca">
          <div className="kpi-info">
            <span className="kpi-label">Valeur Totale du Stock (CA)</span>
            <span className="kpi-value">{chiffreAffaireGlobal.toLocaleString()} Ariary</span>
          </div>
          <div className="kpi-icon icon-money">💰</div>
        </div>
      </div>

      {/* --- SECTION DES FILTRES ET TRIS --- */}
      <div className="filter-section">
        <h3 className="section-subtitle">Filtres de recherche et Tri</h3>
        <div className="filter-row">
          
          {/* Nom */}
          <div className="filter-group">
            <label htmlFor="searchNom">Rechercher par nom</label>
            <input
              type="text"
              id="searchNom"
              placeholder="Ex: Huile, Riz..."
              value={filterNom}
              onChange={(e) => setFilterNom(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Quantité Min */}
          <div className="filter-group">
            <label htmlFor="searchQuantiteMin">Quantité Min</label>
            <input
              type="number"
              id="searchQuantiteMin"
              placeholder="Min"
              value={filterQuantiteMin}
              onChange={(e) => setFilterQuantiteMin(e.target.value)}
              className="form-input"
              min="0"
            />
          </div>

          {/* Quantité Max */}
          <div className="filter-group">
            <label htmlFor="searchQuantiteMax">Quantité Max</label>
            <input
              type="number"
              id="searchQuantiteMax"
              placeholder="Max"
              value={filterQuantiteMax}
              onChange={(e) => setFilterQuantiteMax(e.target.value)}
              className="form-input"
              min="0"
            />
          </div>

          {/* Sélecteur de Tri */}
          <div className="filter-group">
            <label htmlFor="sortBySelect">Trier l'affichage par</label>
            <select
              id="sortBySelect"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-input"
            >
              <option value="az">Nom : de A à Z</option>
              <option value="qty_asc">Quantité : du + petit au + grand</option>
            </select>
          </div>
          
          {/* Bouton de réinitialisation */}
          {(filterNom || filterQuantiteMin || filterQuantiteMax || sortBy !== "az") && (
            <button 
              className="btn-clear-filters"
              onClick={() => { 
                setFilterNom(""); 
                setFilterQuantiteMin(""); 
                setFilterQuantiteMax(""); 
                setSortBy("az"); 
              }}
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* --- TABLEAU DES PRODUITS --- */}
      <div className="table-responsive">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Nom du produit</th>
              <th>Quantité en stock</th>
              <th>Unité</th>
              <th>Prix Unitaire</th>
              <th>Valeur du Stock</th>
            </tr>
          </thead>
          <tbody>
            {produitsTraites.length > 0 ? (
              produitsTraites.map((produit) => (
                <tr key={produit._id}>
                  <td className="product-name-cell">{produit.nom}</td>
                  <td>
                    <span className={`badge ${produit.quantite === 0 ? "badge-danger" : "badge-success"}`}>
                      {produit.quantite}
                    </span>
                  </td>
                  <td>{produit.unite}</td>
                  <td>{produit.prix ? `${produit.prix.toLocaleString()} Ar` : "-"}</td>
                  <td className="total-cell">
                    {((produit.prix || 0) * (produit.quantite || 0)).toLocaleString()} Ar
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">
                  Aucun produit ne correspond à vos critères de recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;