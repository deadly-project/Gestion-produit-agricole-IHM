import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlusCircle, FaHistory, FaPen, FaTrashAlt, FaEye, FaTimes, FaSortAmountDown, FaSortAmountUp, FaFilter } from "react-icons/fa";
import "../css/HistoriqueList.css";

const HistoriqueList = () => {
  const [historiques, setHistoriques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState("");

  // États pour la modale
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ÉTATS DE FILTRE ET DE TRI
  const [filtreAction, setFiltreAction] = useState("TOUS"); // Options: TOUS, AJOUT, MODIFICATION, SUPPRESSION
  const [ordreChrono, setOrdreChrono] = useState("RECENT"); // Options: RECENT (Plus récent au plus ancien), ANCIEN

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

  const formaterDate = (dateString) => {
    const options = { 
      year: "numeric", month: "long", day: "numeric", 
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  const getActionBadge = (action) => {
    switch (action) {
      case "AJOUT": return { icon: <FaPlusCircle />, className: "action-ajout", text: "Ajouté" };
      case "MODIFICATION": return { icon: <FaPen />, className: "action-modif", text: "Modifié" };
      case "SUPPRESSION": return { icon: <FaTrashAlt />, className: "action-suppr", text: "Supprimé" };
      default: return { icon: <FaHistory />, className: "", text: action };
    }
  };

  const detecterChangements = (ancien, nouveau) => {
    if (!ancien || !nouveau) return [];
    const cles = ["nom", "unite", "quantite", "prix"];
    const changements = [];

    cles.forEach((cle) => {
      if (ancien[cle] !== nouveau[cle]) {
        let label = cle === "nom" ? "Nom du produit" : cle === "unite" ? "Unité" : cle === "quantite" ? "Quantité" : "Prix Unitaire";
        let avant = cle === "prix" ? `${ancien[cle]?.toLocaleString()} Ar` : ancien[cle];
        let apres = cle === "prix" ? `${nouveau[cle]?.toLocaleString()} Ar` : nouveau[cle];
        changements.push({ label, avant, apres });
      }
    });
    return changements;
  };

  const genererLignesAudit = (ancien, nouveau) => {
    const cles = [
      { cle: "nom", label: "Nom du produit" },
      { cle: "quantite", label: "Quantité en Stock" },
      { cle: "unite", label: "Unité de mesure" },
      { cle: "prix", label: "Prix Unitaire" }
    ];

    return cles.map(({ cle, label }) => {
      const valAncienne = ancien ? ancien[cle] : null;
      const valNouvelle = nouveau ? nouveau[cle] : null;
      const aChange = ancien && nouveau && valAncienne !== valNouvelle;

      return {
        label,
        avant: cle === "prix" && valAncienne !== null ? `${valAncienne.toLocaleString()} Ar` : valAncienne ?? "-",
        apres: cle === "prix" && valNouvelle !== null ? `${valNouvelle.toLocaleString()} Ar` : valNouvelle ?? "-",
        aChange
      };
    });
  };

  // --- APPLICATION DYNAMIQUE DES FILTRES ET DU TRI (CÔTÉ CLIENT) ---
  const historiquesTraites = historiques
    .filter((item) => filtreAction === "TOUS" || item.action === filtreAction)
    .sort((a, b) => {
      const dateA = new Date(a.dateAction);
      const dateB = new Date(b.dateAction);
      return ordreChrono === "RECENT" ? dateB - dateA : dateA - dateB;
    });

  if (loading) return <div className="historique-loading">Chargement du journal d'audit...</div>;

  return (
    <div className="historique-container">
      <h2 className="historique-title">Journal des Activités & Historique</h2>
      
      {backendError && <div className="alert alert-danger">{backendError}</div>}

      {/* ==================================================== */}
      /* 🛠️ BARRE DE FILTRES ET TRI COMPACTE                 */
      {/* ==================================================== */}
      <div className="historique-toolbar">
        <div className="toolbar-filter">
          <FaFilter className="icon-label" />
          <select 
            value={filtreAction} 
            onChange={(e) => setFiltreAction(e.target.value)}
            className="select-filter"
          >
            <option value="TOUS">Toutes les actions</option>
            <option value="AJOUT">➕ Uniquement les Ajouts</option>
            <option value="MODIFICATION">📝 Uniquement les Modifications</option>
            <option value="SUPPRESSION">🗑️ Uniquement les Suppressions</option>
          </select>
        </div>

        <button 
          className="btn-sort"
          onClick={() => setOrdreChrono(ordreChrono === "RECENT" ? "ANCIEN" : "RECENT")}
          title={ordreChrono === "RECENT" ? "Passer au plus ancien" : "Passer au plus récent"}
        >
          {ordreChrono === "RECENT" ? (
            <>
              <FaSortAmountDown /> Plus récent → Plus ancien
            </>
          ) : (
            <>
              <FaSortAmountUp /> Plus ancien → Plus récent
            </>
          )}
        </button>
      </div>

      {/* Rendu principal de la liste traitée */}
      {historiquesTraites.length === 0 ? (
        <div className="no-historique">Aucune activité ne correspond à vos critères de recherche.</div>
      ) : (
        <div className="timeline">
          {historiquesTraites.map((item) => {
            const badge = getActionBadge(item.action);
            const produitInfos = item.nouvelleValeur || item.ancienneValeur;
            const changements = detecterChangements(item.ancienneValeur, item.nouvelleValeur);

            return (
              <div key={item._id} className="timeline-item">
                <div className={`timeline-icon ${badge.className}`}>
                  {badge.icon}
                </div>

                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className={`action-tag ${badge.className}`}>{badge.text}</span>
                    <span className="timeline-date">{formaterDate(item.dateAction)}</span>
                  </div>

                  <div className="timeline-body-layout">
                    <div className="timeline-body-main">
                      <h3 className="product-title-his">
                        {produitInfos?.nom || `Produit (ID: ${item.produitId})`}
                      </h3>

                      <div className="change-details">
                        {item.action === "AJOUT" && item.nouvelleValeur && (
                          <p className="add-info">
                            Création initiale avec <strong>{item.nouvelleValeur.quantite} {item.nouvelleValeur.unite}</strong> au prix de <strong>{item.nouvelleValeur.prix?.toLocaleString()} Ar</strong>.
                          </p>
                        )}

                        {item.action === "MODIFICATION" && changements.length > 0 && (
                          <div className="compare-box">
                            {changements.map((chg, idx) => (
                              <div key={idx} className="compare-row">
                                <span className="change-label">{chg.label} :</span>
                                <span className="old-val">{chg.avant}</span>
                                <span className="arrow-split">➔</span>
                                <span className="new-val">{chg.apres}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {item.action === "SUPPRESSION" && item.ancienneValeur && (
                          <p className="delete-info">
                            Retiré définitivement. Dernier état : {item.ancienneValeur.quantite} {item.ancienneValeur.unite} restants.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="timeline-body-action">
                      <button className="btn-verify" onClick={() => { setSelectedAudit(item); setIsModalOpen(true); }}>
                        <FaEye /> Vérifier
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================================================== */}
      {/* 🔍 MODALE DE VÉRIFICATION DESIGN TABLEAU COMPARATIF */}
      {/* ==================================================== */}
      {isModalOpen && selectedAudit && (
        <div className="modal-overlay">
          <div className="modal-box audit-modal-box">
            <div className="modal-header">
              <h3 className="modal-title">Inspecteur de données d'inventaire</h3>
              <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="audit-modal-body">
              <div className="audit-meta-grid">
                <div><strong>Type d'action :</strong> <span className={`action-tag ${getActionBadge(selectedAudit.action).className}`}>{selectedAudit.action}</span></div>
                <div><strong>Date & Heure :</strong> {formaterDate(selectedAudit.dateAction)}</div>
                <div><strong>ID Produit :</strong> <code className="code-id">{selectedAudit.produitId}</code></div>
              </div>

              <h4 className="audit-table-title">Comparatif des attributs du document</h4>
              
              <div className="table-responsive">
                <table className="audit-compare-table">
                  <thead>
                    <tr>
                      <th>Champ / Propriété</th>
                      <th>Valeur Avant (Ancienne)</th>
                      <th>Valeur Après (Nouvelle)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {genererLignesAudit(selectedAudit.ancienneValeur, selectedAudit.nouvelleValeur).map((ligne, index) => (
                      <tr key={index} className={ligne.aChange ? "row-changed-highlight" : ""}>
                        <td className="audit-field-label">
                          {ligne.label} {ligne.aChange && <span className="orange-dot">●</span>}
                        </td>
                        <td className="audit-val-old">{ligne.avant}</td>
                        <td className="audit-val-new">{ligne.apres}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-cancel" onClick={() => setIsModalOpen(false)}>Fermer la vue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoriqueList;