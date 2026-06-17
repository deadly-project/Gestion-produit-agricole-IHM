import React, { useState } from "react";
import axios from "axios";
import "../css/AjoutProduit.css";

const AjoutProduit = () => {
  // 1. État du formulaire
  const [formData, setFormData] = useState({
    nom: "",
    unite: "", // Stockera la valeur sélectionnée (ex: "kg", "pcs")
    quantite: 0,
    prix: "",
  });

  // 2. États pour la gestion de l'UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [backendError, setBackendError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Gestion des changements avec sécurité intégrée
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "nom") {
      // Permet les lettres, espaces, tirets et chiffres, mais empêche de commencer par un chiffre ou d'avoir QUE des chiffres
      // Idéal pour éviter les noms de produits comme "12345"
      if (value !== "" && /^\d+$/.test(value)) {
        return; // Bloque si la saisie ne contient que des chiffres
      }
      setFormData({ ...formData, [name]: value });
    } 
    else if (name === "quantite" || name === "prix") {
      // Si le champ est vide (l'utilisateur a effacé), on stocke une chaîne vide pour le prix
      if (value === "") {
        setFormData({ ...formData, [name]: "" });
        return;
      }

      const numValue = Number(value);
      if (isNaN(numValue) || numValue < 0) return; // Bloque le texte ou les valeurs négatives
      
      setFormData({
        ...formData,
        [name]: numValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Déclenché lors du clic sur "Enregistrer"
  const handleOpenModal = (e) => {
    e.preventDefault();
    setBackendError("");
    setSuccessMessage("");
    
    // Trim pour enlever les espaces inutiles au début/fin
    const nomNettoye = formData.nom.trim();

    // 🚨 VALIDATION STRICTE : Nom du produit
    // Empêche les noms vides, uniquement composés de chiffres, ou trop courts
    if (!nomNettoye || /^\d+$/.test(nomNettoye)) {
      setBackendError("Le nom du produit est invalide. Il ne peut pas être composé uniquement de chiffres.");
      return;
    }

    if (nomNettoye.length < 2) {
      setBackendError("Le nom du produit doit contenir au moins 2 caractères.");
      return;
    }

    // 🚨 VALIDATION STRICTE : Unité et Prix
    if (!formData.unite || formData.prix === "") {
      setBackendError("Tous les champs sont obligatoires, y compris le choix de l'unité et le prix.");
      return;
    }

    if (formData.quantite < 0 || Number(formData.prix) < 0) {
      setBackendError("Les valeurs numériques ne peuvent pas être négatives.");
      return;
    }
    
    setIsModalOpen(true);
  };

  // Envoi au serveur Express
  const handleConfirmSubmit = async () => {
    setIsModalOpen(false);
    setIsLoading(true);
    setBackendError("");

    // Préparation des données propres
    const dataToSend = {
      ...formData,
      nom: formData.nom.trim(),
      prix: Number(formData.prix)
    };

    try {
      const response = await axios.post("http://localhost:3000/api/produits", dataToSend);
      
      if (response.status === 201 || response.status === 200) {
        setSuccessMessage("Produit créé avec succès !");
        setFormData({ nom: "", unite: "", quantite: 0, prix: "" }); // Réinitialisation
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setBackendError(error.response.data.message);
      } else {
        setBackendError("Une erreur interne est survenue lors de la création du produit.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Ajouter un nouveau produit</h2>

      {/* Messages d'alerte */}
      {backendError && <div className="alert alert-danger">{backendError}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <form onSubmit={handleOpenModal} className="product-form">
        {/* Nom du produit */}
        <div className="form-group">
          <label htmlFor="nom">Nom du produit <span className="required">*</span></label>
          <input
            type="text"
            id="nom"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            placeholder="Ex: Chaise de bureau (pas uniquement des chiffres)"
            className="form-input"
            required
          />
        </div>

        {/* Quantité et Unité (Select) */}
        <div className="form-row">
          <div className="form-group col">
            <label htmlFor="quantite">Quantité <span className="required">*</span></label>
            <input
              type="number"
              id="quantite"
              name="quantite"
              value={formData.quantite}
              onChange={handleChange}
              className="form-input"
              min="0"
              required
            />
          </div>

          <div className="form-group col">
            <label htmlFor="unite">Unité <span className="required">*</span></label>
            <select
              id="unite"
              name="unite"
              value={formData.unite}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="" disabled>Choisir...</option>
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

        {/* Prix */}
        <div className="form-group">
          <label htmlFor="prix">Prix (Ariary) <span className="required">*</span></label>
          <input
            type="number"
            id="prix"
            name="prix"
            value={formData.prix}
            onChange={handleChange}
            placeholder="0.00"
            className="form-input"
            step="0.01"
            min="0"
            required
          />
        </div>

        <button type="submit" className="btn btn-submit" disabled={isLoading}>
          {isLoading ? "Traitement..." : "Enregistrer le produit"}
        </button>
      </form>

      {/* --- MODALE DE CONFIRMATION --- */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="modal-title">Confirmer l'ajout ?</h3>
            <p className="modal-text">
              Voulez-vous vraiment ajouter le produit <strong>{formData.nom.trim()}</strong> ?
            </p>
            <div className="modal-summary">
              <p><strong>Quantité :</strong> {formData.quantite} {formData.unite}</p>
              <p><strong>Prix :</strong> {Number(formData.prix).toLocaleString()} Ariary</p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-cancel" onClick={() => setIsModalOpen(false)}>
                Annuler
              </button>
              <button className="btn btn-confirm" onClick={handleConfirmSubmit}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AjoutProduit;