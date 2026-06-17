import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaPlusCircle, FaMinusCircle, FaSearch } from "react-icons/fa";
import "../css/MouvementStock.css";

const MouvementStock = () => {
  // 1. États pour les données et le formulaire
  const [produits, setProduits] = useState([]);
  const [selectedProduit, setSelectedProduit] = useState(null); // Stockera l'objet produit complet
  const [typeMouvement, setTypeMouvement] = useState("entree");
  const [quantiteSaisie, setQuantiteSaisie] = useState(1);

  // 2. États pour le moteur de recherche interne (IHM)
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null); // Pour fermer la liste si on clique ailleurs

  // 3. États de l'UI
  const [isLoading, setIsLoading] = useState(false);
  const [backendError, setBackendError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchProduits();
    
    // Écouteur pour fermer la liste déroulante lors d'un clic à l'extérieur
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchProduits = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/produits");
      setProduits(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setBackendError("Impossible de charger la liste des produits.");
    }
  };

  // Filtrage des produits en temps réel selon la saisie
  const produitsFilitres = produits.filter((p) =>
    p.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuantiteChange = (e) => {
    const val = Number(e.target.value);
    if (val < 1) return;
    setQuantiteSaisie(val);
  };

  // Sélection d'un produit dans la liste de recherche
  const handleSelectProduit = (produit) => {
    setSelectedProduit(produit);
    setSearchTerm(produit.nom); // Remplit le champ avec le nom choisi
    setIsDropdownOpen(false);
    setBackendError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendError("");
    setSuccessMessage("");

    if (!selectedProduit) {
      setBackendError("Veuillez sélectionner un produit valide dans la liste.");
      return;
    }

    let nouvelleQuantite = selectedProduit.quantite;
    if (typeMouvement === "entree") {
      nouvelleQuantite += quantiteSaisie;
    } else {
      nouvelleQuantite -= quantiteSaisie;
      if (nouvelleQuantite < 0) {
        setBackendError(
          `Action impossible. Stock actuel de "${selectedProduit.nom}" (${selectedProduit.quantite}) insuffisant.`
        );
        return;
      }
    }

    setIsLoading(true);

    try {
      const response = await axios.put(`http://localhost:3000/api/produits/${selectedProduit._id}`, {
        quantite: nouvelleQuantite,
      });

      if (response.status === 200) {
        setSuccessMessage(
          `Mouvement enregistré ! Nouveau stock pour "${selectedProduit.nom}" : ${nouvelleQuantite} ${selectedProduit.unite}`
        );
        // Réinitialisation
        setSelectedProduit(null);
        setSearchTerm("");
        setQuantiteSaisie(1);
        fetchProduits();
      }
    } catch (error) {
      setBackendError(error.response?.data?.message || "Erreur lors du traitement.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="movement-container">
      <h2 className="movement-title">Mouvement de Stock (Entrée / Sortie)</h2>

      {backendError && <div className="alert alert-danger">{backendError}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <form onSubmit={handleSubmit} className="movement-form">
        
        {/* --- ZONE DE RECHERCHE DYNAMIQUE (AUTOCOMPLETE) --- */}
        <div className="form-group search-autocomplete-container" ref={dropdownRef}>
          <label htmlFor="produitSearch">Sélectionner le produit <span className="required">*</span></label>
          <div className="search-input-wrapper">
            <FaSearch className="search-icon-inside" />
            <input
              type="text"
              id="produitSearch"
              placeholder="Cliquer ou Tapez le nom pour rechercher..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedProduit(null); // Réinitialise la sélection si l'utilisateur re-tape du texte
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              className="form-input search-padding"
              autoComplete="off"
              required
            />
          </div>

          {/* Liste déroulante des résultats filtrés */}
          {isDropdownOpen  && (
            <ul className="autocomplete-dropdown">
              {produitsFilitres.length > 0 ? (
                produitsFilitres.map((p) => (
                  <li key={p._id} onClick={() => handleSelectProduit(p)} className="dropdown-item">
                    <span className="item-name">{p.nom}</span>
                    <span className="item-stock">En stock : {p.quantite} {p.unite}</span>
                  </li>
                ))
              ) : (
                <li className="dropdown-no-result">Aucun produit trouvé</li>
              )}
            </ul>
          )}
          
          {/* Indicateur de produit actuellement validé */}
          {selectedProduit && (
            <div className="selected-badge">
              Produit sélectionné : <strong>{selectedProduit.nom}</strong> ({selectedProduit.quantite} {selectedProduit.unite} restants)
            </div>
          )}
        </div>

        {/* --- TYPE DE MOUVEMENT --- */}
        <div className="form-group">
          <label>Type de mouvement <span className="required">*</span></label>
          <div className="radio-tile-group">
            <label className={`radio-tile-label ${typeMouvement === "entree" ? "active-in" : ""}`}>
              <input
                type="radio"
                name="typeMouvement"
                value="entree"
                checked={typeMouvement === "entree"}
                onChange={() => setTypeMouvement("entree")}
                className="radio-input"
              />
              <div className="tile-content">
                <FaPlusCircle className="tile-icon icon-in" />
                <span>Entrée (Approvisionnement)</span>
              </div>
            </label>

            <label className={`radio-tile-label ${typeMouvement === "sortie" ? "active-out" : ""}`}>
              <input
                type="radio"
                name="typeMouvement"
                value="sortie"
                checked={typeMouvement === "sortie"}
                onChange={() => setTypeMouvement("sortie")}
                className="radio-input"
              />
              <div className="tile-content">
                <FaMinusCircle className="tile-icon icon-out" />
                <span>Sortie (Vente / Perte)</span>
              </div>
            </label>
          </div>
        </div>

        {/* --- QUANTITÉ --- */}
        <div className="form-group">
          <label htmlFor="quantiteMouvement">
            Quantité à {typeMouvement === "entree" ? "ajouter" : "retirer"}{" "}
            {selectedProduit ? `(${selectedProduit.unite})` : ""}{" "}
            <span className="required">*</span>
          </label>
          <input
            type="number"
            id="quantiteMouvement"
            value={quantiteSaisie}
            onChange={handleQuantiteChange}
            className="form-input"
            min="1"
            required
          />
        </div>

        <button
          type="submit"
          className={`btn btn-movement-submit ${typeMouvement === "entree" ? "btn-in" : "btn-out"}`}
          disabled={isLoading || !selectedProduit}
        >
          {isLoading ? "Mise à jour..." : `Valider l'${typeMouvement === "entree" ? "entrée" : "sortie"}`}
        </button>
      </form>
    </div>
  );
};

export default MouvementStock;