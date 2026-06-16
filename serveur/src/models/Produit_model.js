import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({

    nom: {
        type: String,
        required: true,
        trim: true
    },

    unite: {
        type: String,
        required: true
    },

    quantite: {
        type: Number,
        default: 0,
        min: 0
    },

    prix: {
        type: Number,
        required: true,
        min: 0
    },

    dateAjout: {
        type: Date,
        default: Date.now
    }

});

const Produit = mongoose.model(
    "Produit",
    ProductSchema
);

export default Produit;