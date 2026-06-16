import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlusCircle, FaHistory, FaPen, FaTrashAlt } from "react-icons/fa";
import "../css/HistoriqueList.css";

const HistoriqueList = () => {
  const [historiques, setHistoriques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState("");

  useEffect(() => {
    fetchHistoriques();
  }, []);

  const fetchHistoriques = async () => {
    setLoading(true);
    setBackendError("");
    try {
      const response = await axios.get("http://localhost:3000/api/historiques");
      setHistoriques(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setBackendError(error.response?.data?.message || "Impossible de charger l'historique.");
    } finally {
      setLoading(false);
    }
  };

  // Fonction utilitaire IHM pour formater la date proprement
  const formaterDate = (dateString) => {
    const options = { 
      year: "numeric", month: "long", day: "numeric", 
      hour: "2-digit", minute: "2-digit" 
    };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  // Rendu de l'icône et du badge selon le type d'action
  const getActionBadge = (action) => {
    switch (action) {
      case "AJOUT":
        return { icon: <FaPlusCircle />, className: "action-ajout", text: "Ajouté" };
      case "MODIFICATION":
        return { icon: <FaPen />, className: "action-modif", text: "Modifié" };
      case "SUPPRESSION":
        return { icon: <FaTrashAlt />, className: "action-suppr", text: "Supprimé" };
      default:
        return { icon: <FaHistory />, className: "", text: action };
    }
  };

  if (loading) return <div className="historique-loading">Chargement du journal d'audit...</div>;

  return (
    <div className="historique-container">
      <h2 className="historique-title">Journal des Activités & Historique</h2>
      
      {backendError && <div className="alert alert-danger">{backendError}</div>}

      {historiques.length === 0 ? (
        <div className="no-historique">Aucune activité enregistrée pour le moment.</div>
      ) : (
        /* STRUCTURE EN LIGNE DU TEMPS (TIMELINE) */
        <div className="timeline">
          {historiques.map((item) => {
            const badge = getActionBadge(item.action);
            // On récupère la valeur pertinente pour afficher le titre de l'élément
            const produitInfos = item.nouvelleValeur || item.ancienneValeur;

            return (
              <div key={item._id} className="timeline-item">
                
                {/* Icône flottante à gauche */}
                <div className={`timeline-icon ${badge.className}`}>
                  {badge.icon}
                </div>

                {/* Contenu de la carte d'activité */}
                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className={`action-tag ${badge.className}`}>{badge.text}</span>
                    <span className="timeline-date">{formaterDate(item.dateAction)}</span>
                  </div>

                  <h3 className="product-title-his">
                    {produitInfos?.nom || `Produit (ID: ${item.produitId || 'Supprimé'})`}
                  </h3>

                  {/* --- DÉTAILS DU CHANGEMENT SELON L'ACTION (IHM AUDIT) --- */}
                  <div className="change-details">
                    
                    {/* Cas 1 : Création de produit */}
                    {item.action === "AJOUT" && item.nouvelleValeur && (
                      <p className="add-info">
                        Initialisé avec un stock de <strong>{item.nouvelleValeur.quantite} {item.nouvelleValeur.unite}</strong> au prix de <strong>{item.nouvelleValeur.prix?.toLocaleString()} Ar</strong>
                      </p>
                    )}

                    {/* Cas 2 : Modification / Mouvement de stock */}
                    {item.action === "MODIFICATION" && item.ancienneValeur && item.nouvelleValeur && (
                      <div className="compare-box">
                        <div className="compare-row">
                          <span>Quantité :</span>
                          <span className="old-val">{item.ancienneValeur.quantite}</span>
                          <span className="arrow-split">➔</span>
                          <span className="new-val">{item.nouvelleValeur.quantite} {item.nouvelleValeur.unite}</span>
                        </div>
                        {item.ancienneValeur.prix !== item.nouvelleValeur.prix && (
                          <div className="compare-row">
                            <span>Prix :</span>
                            <span className="old-val">{item.ancienneValeur.prix?.toLocaleString()} Ar</span>
                            <span className="arrow-split">➔</span>
                            <span className="new-val">{item.nouvelleValeur.prix?.toLocaleString()} Ar</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Cas 3 : Suppression définitive */}
                    {item.action === "SUPPRESSION" && item.ancienneValeur && (
                      <p className="delete-info">
                        Retiré définitivement. Dernier état connu : {item.ancienneValeur.quantite} {item.ancienneValeur.unite} en stock.
                      </p>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoriqueList;