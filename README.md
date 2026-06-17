# 🌾 Système de Gestion de Produits Agricoles

Une application web **Full-Stack (React & Node.js)** moderne et épurée dédiée au suivi des stocks, à la gestion des flux (entrées/sorties) et à l'audit complet des changements pour des produits agricoles.

---

## 🛠️ Prérequis

Avant de commencer, assurez-vous d'avoir installé les technologies suivantes sur votre machine :

| Outil | Version | Lien |
|-------|---------|------|
| **Node.js** | v24 | [Télécharger Node.js v24](https://nodejs.org/fr/download) |
| **MongoDB Community Edition** | Dernière stable | [Guide d'installation MongoDB](https://www.mongodb.com/docs/manual/administration/install-community/#std-label-install-mdb-community-edition) |

---

## 🚀 Guide de Configuration et Lancement

### Étape 1 — Démarrer la Base de Données

Ouvrez un terminal et lancez le service MongoDB :

```bash
sudo systemctl start mongodb.service
```

---

### Étape 2 — Configurer et lancer le Backend (`/serveur`)

Ouvrez un terminal, placez-vous dans le répertoire backend et installez les dépendances :

```bash
cd serveur
npm install
```

Créez un fichier `.env` à la racine du dossier `/serveur` avec le contenu suivant :

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/gestion-produits-agricoles
```

Lancez le serveur backend :

```bash
npm run dev
```

> ✅ Le serveur backend sera actif à l'adresse : **http://localhost:3000**

---

### Étape 3 — Configurer et lancer le Frontend (`/frontend/frontend-gestion-produit-agricole`)

Ouvrez un **second terminal**, accédez au dossier client, installez les modules et démarrez l'interface :

```bash
cd frontend/frontend-gestion-produit-agricole
npm install
npm run dev
```

> ✅ Ouvrez le lien affiché dans votre terminal (ex : **http://localhost:5173**) pour interagir avec l'application.

---

## 📦 Fonctionnalités Clés

### 📊 1. Tableau de Bord (Dashboard)

- **Filtres modernes sur une ligne** : Tous les filtres (recherche, quantité, tris) sont alignés sur une seule ligne grâce à un agencement CSS strict (`flex-wrap: nowrap`) avec une taille équitablement répartie.
- **KPI & Modales** : Affichage de la valeur totale du stock en **Ariary (Ar)**. Les modales de confirmation disposent d'animations d'alertes fluides et finalisées.

---

### 🔍 2. Journal d'Audit & Activités (`HistoriqueList.jsx`)

- **Inspecteur épuré** : La modale de vérification a été allégée pour éviter la surcharge d'informations. L'ID brut du produit est retiré pour laisser place à un affichage clair de la **Date** et de l'**Heure exacte** de l'action.
- **Tableau comparatif** : Génère une comparaison ligne par ligne des valeurs modifiées (**Avant / Après**) avec un indicateur visuel sur les propriétés qui ont changé.

---

### 🔄 3. Mouvements de Stock (`MouvementStock.jsx`)

- **Moteur d'autocomplétion intelligent** : Au focus ou au clic dans le champ de recherche, l'intégralité du catalogue de produits s'affiche immédiatement. Le filtre s'applique dynamiquement dès que l'utilisateur commence à taper.
- **Sécurisation des flux** : Prise en charge des **entrées** et des **sorties** avec un contrôle strict empêchant le stock de passer en valeur négative en cas de quantité insuffisante.

---

## 📂 Architecture des Répertoires

```
├── serveur/
│   ├── .env                  # Configuration du port et de l'URI MongoDB
│   ├── package.json          # Dépendances et scripts (npm run dev)
│   └── ...
└── frontend/
    └── frontend-gestion-produit-agricole/
        ├── src/
        │   ├── css/          # Feuilles de style (MouvementStock, HistoriqueList, etc.)
        │   └── components/   # Composants React de l'IHM
        ├── package.json      # Scripts Vite/React (npm run dev)
        └── ...
```

---

## 📝 Récapitulatif des Commandes

```bash
# 1. Démarrer MongoDB
sudo systemctl start mongodb.service

# 2. Backend
cd serveur && npm install && npm run dev

# 3. Frontend (dans un second terminal)
cd frontend/frontend-gestion-produit-agricole && npm install && npm run dev
```
