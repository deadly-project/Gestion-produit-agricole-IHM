import React, { useState, useEffect } from "react";
import axios from "axios"; 
import { FaEdit, FaTrash, FaTimes, FaCheckCircle, FaExclamationCircle } from "react-icons/fa"; // ✅ Ajout de FaExclamationCircle
import "../css/Dashboard.css";

const Dashboard = () => {
  // --- ÉTATS EXISTANTS ---
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState("");
  const [filterNom, setFilterNom] = useState("");
  const [filterQuantiteMin, setFilterQuantiteMin] = useState("");
  const [filterQuantiteMax, setFilterQuantiteMax] = useState("");
  const [sortBy, setSortBy] = useState("az");

  // --- NOUVEAUX ÉTATS POUR LA SUPPRESSION & MODIFICATION ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState(null); 
  const [editFormData, setEditFormData] = useState({ nom: "", unite: "", quantite: 0, prix: "" });

  // --- ÉTATS POUR LES ALERTES DE SUCCÈS ---
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

  // --- LOGIQUE DE SUPPRESSION ---
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
      setSuccessMessage(`Le produit "${selectedProduit.nom}" a bien été supprimé du stock.`);
      setIsSuccessDeleteOpen(true); 
    } catch (error) {
      setBackendError(error.response?.data?.message || "Erreur lors de la suppression.");
      setIsDeleteModalOpen(false);
    }
  };

  // --- LOGIQUE DE MODIFICATION ---
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

  // --- LOGIQUE DE FILTRAGE ET DE TRI ---
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

  if (loading) return <div className="dashboard-loading">Chargement du tableau de bord...</div>;

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
            <label htmlFor="sortBySelect">Trier l'affichage par</label>
            <select id="sortBySelect" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="form-input">
              <option value="az">Nom : de A à Z</option>
              <option value="qty_asc">Quantité : du + petit au + grand</option>
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
              <th>Quantité en stock</th>
              <th>Unité</th>
              <th>Prix Unitaire</th>
              <th>Valeur du Stock</th>
              <th>Actions</th>
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
                  <td className="total-cell">{((produit.prix || 0) * (produit.quantite || 0)).toLocaleString()} Ar</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon btn-edit" title="Modifier" onClick={() => handleOpenEditModal(produit)}>
                        <FaEdit />
                      </button>
                      <button className="btn-icon btn-delete" title="Supprimer" onClick={() => handleOpenDeleteModal(produit)}>
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">Aucun produit ne correspond à vos critères.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ==================================================== */}
      {/* 🔴 MODALE DE CONFIRMATION DE SUPPRESSION            */}
      {/* ==================================================== */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box modal-danger">
            <h3 className="modal-title">⚠️ Attention : Action Irréversible</h3>
            <p className="modal-text">
              Voulez-vous vraiment supprimer définitivement le produit <strong>{selectedProduit?.nom}</strong> du stock ?
            </p>
            <div className="modal-actions">
              <button className="btn btn-cancel" onClick={() => setIsDeleteModalOpen(false)}>Annuler</button>
              <button className="btn btn-confirm-delete" onClick={handleConfirmDelete}>Supprimer définitivement</button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 📝 MODALE FORMULAIRE DE MODIFICATION                */}
      {/* ==================================================== */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box modal-edit-box">
            <div className="modal-header">
              <h3 className="modal-title">Modifier le produit</h3>
              <button className="close-modal-btn" onClick={() => setIsEditModalOpen(false)}><FaTimes /></button>
            </div>
            
            <form onSubmit={handleConfirmEditSubmit} className="product-form">
              <div className="form-group">
                <label>Nom du produit <span className="required">*</span></label>
                <input type="text" name="nom" value={editFormData.nom} onChange={handleEditChange} className="form-input" required />
              </div>

              <div className="form-row">
                <div className="form-group col">
                  <label>Quantité <span className="required">*</span></label>
                  <input type="number" name="quantite" value={editFormData.quantite} onChange={handleEditChange} className="form-input" min="0" required />
                </div>

                <div className="form-group col">
                  <label>Unité <span className="required">*</span></label>
                  <select name="unite" value={editFormData.unite} onChange={handleEditChange} className="form-input" required>
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

              <div className="form-group">
                <label>Prix (Ariary) <span className="required">*</span></label>
                <input type="number" name="prix" value={editFormData.prix} onChange={handleEditChange} className="form-input" step="0.01" min="0" required />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-cancel" onClick={() => setIsEditModalOpen(false)}>Annuler</button>
                <button type="submit" className="btn btn-confirm">Mettre à jour</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 🎉 MODALE DE SUCCÈS : MODIFICATION (VERTE)          */}
      {/* ==================================================== */}
      {isSuccessEditOpen && (
        <div className="modal-overlay">
          <div className="modal-box success-modal-box">
            <FaCheckCircle className="icon-success-modal" />
            <h3 className="modal-title-status">Modification réussie !</h3>
            <p className="modal-text-status">{successMessage}</p>
            <div className="modal-actions-center">
              <button className="btn btn-ok-success" onClick={() => fermerSuccesModale("edit")}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 🛑 MODALE DE SUCCÈS : SUPPRESSION (ROUGE)           */}
      {/* ==================================================== */}
      {isSuccessDeleteOpen && (
        <div className="modal-overlay">
          <div className="modal-box delete-success-modal-box">
            <FaCheckCircle className="icon-delete-success-modal" />
            <h3 className="modal-title-status">Produit Supprimé !</h3>
            <p className="modal-text-status">{successMessage}</p>
            <div className="modal-actions-center">
              <button className="btn btn-ok-delete" onClick={() => fermerSuccesModale("delete")}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;