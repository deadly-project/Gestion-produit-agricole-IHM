import mongoose from "mongoose";

const HistoriqueSchema = new mongoose.Schema({

    action: {
        type: String,
        enum: [
            "AJOUT",
            "MODIFICATION",
            "SUPPRESSION"
        ],
        required: true
    },

    produitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Produit"
    },

    ancienneValeur: {
        type: Object,
        default: null
    },

    nouvelleValeur: {
        type: Object,
        default: null
    },

    dateAction: {
        type: Date,
        default: Date.now
    }

});

export default mongoose.model(
    "Historique",
    HistoriqueSchema
);