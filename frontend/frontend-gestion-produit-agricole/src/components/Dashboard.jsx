import React, { useState, useEffect } from "react";
import axios from "axios"; 
import { FaEdit, FaTrash, FaTimes, FaCheckCircle, FaExclamationCircle, FaBoxes, FaDollarSign, FaSearch, FaSlidersH } from "react-icons/fa";
import "../css/Dashboard.css";

const Dashboard = () => {
  // --- ÉTATS ---
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState("");
  const [filterNom, setFilterNom] = useState("");
  const [filterQuantiteMin, setFilterQuantiteMin] = useState("");
  const [filterQuantiteMax, setFilterQuantiteMax] = useState("");
  const [sortBy, setSortBy] = useState("az");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState(null); 
  const [editFormData, setEditFormData] = useState({ nom: "", unite: "", quantite: 0, prix: "" });

  const [isSuccessEditOpen, setIsSuccessEditOpen] = useState(false);
  const [isSuccessDeleteOpen, setIsSuccessDeleteOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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
      setBackendError(error.response?.data?.message || "Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  };

  // --- SUPPRESSION ---
  const handleOpenDeleteModal = (produit) => {
    setSelectedProduit(produit);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduit) return;
    setBackendError("");
    try {
      await axios.delete(`http://localhost:3000/api/produits/${selectedProduit._id}`);
      setProduits(produits.filter((p) => p._id !== selectedProduit._id));
      setIsDeleteModalOpen(false);
      setSuccessMessage(`Le produit "${selectedProduit.nom}" a bien été supprimé.`);
      setIsSuccessDeleteOpen(true); 
    } catch (error) {
      setBackendError(error.response?.data?.message || "Erreur lors de la suppression.");
      setIsDeleteModalOpen(false);
    }
  };

  // --- MODIFICATION ---
  const handleOpenEditModal = (produit) => {
    setSelectedProduit(produit);
    setEditFormData({
      nom: produit.nom,
      unite: produit.unite,
      quantite: produit.quantite,
      prix: produit.prix,
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === "nom") {
      if (value !== "" && /^\d+$/.test(value)) return;
      setEditFormData({ ...editFormData, [name]: value });
    }
    else if (name === "quantite" || name === "prix") {
      if (value === "") {
        setEditFormData({ ...editFormData, [name]: "" });
        return;
      }
      const numValue = Number(value);
      if (numValue < 0) return; 
      setEditFormData({ ...editFormData, [name]: numValue });
    } else {
      setEditFormData({ ...editFormData, [name]: value });
    }
  };

  const handleConfirmEditSubmit = async (e) => {
    e.preventDefault();
    setBackendError("");

    if (!editFormData.nom.trim() || /^\d+$/.test(editFormData.nom)) {
      setBackendError("Le nom du produit n'est pas valide.");
      return;
    }

    try {
      const response = await axios.put(`http://localhost:3000/api/produits/${selectedProduit._id}`, {
        ...editFormData,
        nom: editFormData.nom.trim(),
        prix: Number(editFormData.prix)
      });

      const produitMisAJour = response.data.produit || { ...selectedProduit, ...editFormData, nom: editFormData.nom.trim() };
      setProduits(produits.map((p) => (p._id === selectedProduit._id ? produitMisAJour : p)));

      setIsEditModalOpen(false);
      setSuccessMessage(`Le produit "${editFormData.nom.trim()}" a été modifié avec succès.`);
      setIsSuccessEditOpen(true); 
    } catch (error) {
      setBackendError(error.response?.data?.message || "Erreur lors de la modification.");
    }
  };

  const fermerSuccesModale = (type) => {
    if (type === "edit") setIsSuccessEditOpen(false);
    if (type === "delete") setIsSuccessDeleteOpen(false);
    setSelectedProduit(null);
    setSuccessMessage("");
  };

  // --- FILTRES ET TRI ---
  const produitsTraites = produits
    .filter((produit) => {
      const matchNom = produit.nom.toLowerCase().includes(filterNom.toLowerCase());
      const matchMin = filterQuantiteMin === "" || produit.quantite >= Number(filterQuantiteMin);
      const matchMax = filterQuantiteMax === "" || produit.quantite <= Number(filterQuantiteMax);
      return matchNom && matchMin && matchMax;
    })
    .sort((a, b) => {
      if (sortBy === "az") return a.nom.localeCompare(b.nom);
      if (sortBy === "qty_asc") return a.quantite - b.quantite;
      return 0;
    });

  const totalProduits = produits.length;
  const chiffreAffaireGlobal = produits.reduce((total, p) => total + ((p.prix || 0) * (p.quantite || 0)), 0);

  if (loading) return <div className="dashboard-loading"><div className="spinner"></div>Chargement des stocks...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header-zone">
        <h2 className="dashboard-title">Tableau de Bord des Stocks</h2>
        <p className="dashboard-subtitle-global">Gérez et suivez l'état de vos inventaires en temps réel.</p>
      </header>

      {backendError && <div className="alert alert-danger">{backendError}</div>}

      {/* --- SECTION DES BLOCS KPI --- */}
      <div className="kpi-grid">
        <div className="kpi-card card-blue">
          <div className="kpi-info">
            <span className="kpi-label">Nombre de Produits</span>
            <span className="kpi-value">{totalProduits}</span>
          </div>
          <div className="kpi-icon-wrapper"><FaBoxes /></div>
        </div>

        <div className="kpi-card card-green">
          <div className="kpi-info">
            <span className="kpi-label">Valeur Totale du Stock</span>
            <span className="kpi-value">
              {chiffreAffaireGlobal.toLocaleString()} <span className="currency">Ar</span>
            </span>
          </div>
          <div className="kpi-icon-wrapper"><FaDollarSign /></div>
        </div>
      </div>

      {/* --- SECTION DES FILTRES ET TRIS --- */}
      <div className="filter-section">
        <div className="filter-header-inline">
          <FaSlidersH className="filter-title-icon" />
          <h3 className="section-subtitle">Filtres et outils de tri</h3>
        </div>
        <div className="filter-row">
          <div className="filter-group search-input-wrapper">
            <label htmlFor="searchNom">Rechercher un produit</label>
            <div className="input-with-icon">
              <FaSearch className="inner-input-icon" />
              <input
                type="text"
                id="searchNom"
                placeholder="Ex: Huile, Riz..."
                value={filterNom}
                onChange={(e) => setFilterNom(e.target.value)}
                className="form-input text-indent-icon"
              />
            </div>
          </div>

          <div className="filter-group">
            <label htmlFor="searchQuantiteMin">Quantité Min</label>
            <input
              type="number"
              id="searchQuantiteMin"
              value={filterQuantiteMin}
              onChange={(e) => setFilterQuantiteMin(e.target.value)}
              className="form-input"
              min="0"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="searchQuantiteMax">Quantité Max</label>
            <input
              type="number"
              id="searchQuantiteMax"
              value={filterQuantiteMax}
              onChange={(e) => setFilterQuantiteMax(e.target.value)}
              className="form-input"
              min="0"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="sortBySelect">Trier par</label>
            <select id="sortBySelect" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="form-input select-custom">
              <option value="az">Nom : de A à Z</option>
              <option value="qty_asc">Quantité : Ordre croissant</option>
            </select>
          </div>
          
          {(filterNom || filterQuantiteMin || filterQuantiteMax || sortBy !== "az") && (
            <button className="btn-clear-filters" onClick={() => { setFilterNom(""); setFilterQuantiteMin(""); setFilterQuantiteMax(""); setSortBy("az"); }}>
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
              <th>État / Quantité</th>
              <th>Unité</th>
              <th>Prix Unitaire</th>
              <th>Valeur du Stock</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {produitsTraites.length > 0 ? (
              produitsTraites.map((produit) => (
                <tr key={produit._id} className="table-hover-row">
                  <td className="product-name-cell">{produit.nom}</td>
                  <td>
                    <span className={`badge ${produit.quantite === 0 ? "badge-danger" : "badge-success"}`}>
                      {produit.quantite === 0 ? "Rupture" : `${produit.quantite}`}
                    </span>
                  </td>
                  <td className="text-muted-cell">{produit.unite}</td>
                  <td className="price-cell">{produit.prix ? `${produit.prix.toLocaleString()} Ar` : "-"}</td>
                  <td className="total-cell">{((produit.prix || 0) * (produit.quantite || 0)).toLocaleString()} Ar</td>
                  <td>
                    <div className="action-buttons-end">
                      <button className="btn-modern-action btn-mod-edit" title="Modifier" onClick={() => handleOpenEditModal(produit)}>
                        <FaEdit />
                      </button>
                      <button className="btn-modern-action btn-mod-delete" title="Supprimer" onClick={() => handleOpenDeleteModal(produit)}>
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">Aucun produit trouvé selon vos critères.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODALE : CONFIRMATION DE SUPPRESSION --- */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box glass-modal modal-danger-border">
            <div className="modal-danger-header-icon"><FaExclamationCircle /></div>
            <h3 className="modal-title-modern">Action Irréversible</h3>
            <p className="modal-text-modern">
              Voulez-vous supprimer définitivement <strong>{selectedProduit?.nom}</strong> ? Cette action videra son emplacement physique en base.
            </p>
            <div className="modal-actions-modern">
              <button className="btn-modern btn-secondary-mod" onClick={() => setIsDeleteModalOpen(false)}>Annuler</button>
              <button className="btn-modern btn-danger-mod" onClick={handleConfirmDelete}>Confirmer la suppression</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODALE : FORMULAIRE DE MODIFICATION --- */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box glass-modal modal-edit-box-modern">
            <div className="modal-header-modern">
              <div>
                <h3 className="modal-title-modern" style={{ margin: 0 }}>Modifier la référence</h3>
                <span className="modal-subtitle-modern">ID: {selectedProduit?._id}</span>
              </div>
              <button className="close-modal-btn-modern" onClick={() => setIsEditModalOpen(false)}><FaTimes /></button>
            </div>
            
            <form onSubmit={handleConfirmEditSubmit} className="product-form-modern">
              <div className="form-group-modern">
                <label className="label-modern">Nom du produit <span className="required">*</span></label>
                <input type="text" name="nom" value={editFormData.nom} onChange={handleEditChange} className="form-input-modern" required />
              </div>

              <div className="form-row-modern">
                <div className="form-group-modern flex-1">
                  <label className="label-modern">Quantité <span className="required">*</span></label>
                  <input type="number" name="quantite" value={editFormData.quantite} onChange={handleEditChange} className="form-input-modern" min="0" required />
                </div>

                <div className="form-group-modern flex-1">
                  <label className="label-modern">Unité <span className="required">*</span></label>
                  <select name="unite" value={editFormData.unite} onChange={handleEditChange} className="form-input-modern select-custom" required>
                    <option value="pcs">Pièce (pcs)</option>
                    <option value="kg">Kilogramme (kg)</option>
                    <option value="g">Gramme (g)</option>
                    <option value="L">Litre (L)</option>
                    <option value="paquet">Paquet</option>
                    <option value="boite">Boîte</option>
                    <option value="sac">Sac</option>
                  </select>
                </div>
              </div>

              <div className="form-group-modern">
                <label className="label-modern">Prix de vente (Ariary) <span className="required">*</span></label>
                <input type="number" name="prix" value={editFormData.prix} onChange={handleEditChange} className="form-input-modern" step="0.01" min="0" required />
              </div>

              <div className="modal-actions-modern mt-4">
                <button type="button" className="btn-modern btn-secondary-mod" onClick={() => setIsEditModalOpen(false)}>Annuler</button>
                <button type="submit" className="btn-modern btn-primary-mod">Enregistrer les modifications</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODALE : SUCCÈS MODIFICATION (VERTE) --- */}
      {isSuccessEditOpen && (
        <div className="modal-overlay">
          <div className="modal-box status-glass-modal border-top-success">
            <FaCheckCircle className="icon-status-success animate-scale" />
            <h3 className="modal-title-status">Mise à jour réussie</h3>
            <p className="modal-text-status">{successMessage}</p>
            <button className="btn-status-ok bg-success-btn" onClick={() => fermerSuccesModale("edit")}>OK</button>
          </div>
        </div>
      )}

      {/* --- MODALE : SUCCÈS SUPPRESSION (ROUGE) --- */}
      {isSuccessDeleteOpen && (
        <div className="modal-overlay">
          <div className="modal-box status-glass-modal border-top-danger">
            <FaExclamationCircle className="icon-status-danger animate-scale" />
            <h3 className="modal-title-status" style={{ color: "#e11d48" }}>Destruction réussie</h3>
            <p className="modal-text-status">{successMessage}</p>
            <button className="btn-status-ok bg-danger-btn" onClick={() => fermerSuccesModale("delete")}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;