import express from "express";
import Produit from "../models/Produit_model.js";
import Historique from "../models/Historique.js";

const router = express.Router();


// ======================
// CREATE
// ======================
router.post("/", async (req, res) => {
    try {

        const { nom, unite, quantite, prix } = req.body;

        if (!nom || !unite || prix === undefined) {
            return res.status(400).json({
                message: "Tous les champs obligatoires doivent être renseignés."
            });
        }

        const produitExistant = await Produit.findOne({
            nom: {
                $regex: `^${nom.trim()}$`,
                $options: "i"
            }
        });

        if (produitExistant) {
            return res.status(409).json({
                message: "Ce produit existe déjà."
            });
        }

        const produit = new Produit({
            nom: nom.trim(),
            unite,
            quantite,
            prix
        });

        await produit.save();

        await Historique.create({
            action: "AJOUT",
            produitId: produit._id,
            nouvelleValeur: produit.toObject()
        });

        res.status(201).json({
            message: "Produit créé avec succès",
            produit
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
});

// ======================
// READ ALL
// ======================
router.get("/", async (req, res) => {

    try {

        const produits = await Produit.find()
            .sort({ dateAjout: -1 });

        res.status(200).json(produits);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// ======================
// READ ONE
// ======================
router.get("/:id", async (req, res) => {

    try {

        const produit = await Produit.findById(req.params.id);

        if (!produit) {
            return res.status(404).json({
                message: "Produit introuvable"
            });
        }

        res.status(200).json(produit);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// ======================
// UPDATE
// ======================
router.put("/:id", async (req, res) => {

    try {
        const ancienProduit = await Produit.findById(req.params.id);

        if (!ancienProduit) {
            return res.status(404).json({
                message: "Produit introuvable"
            });
        }

        const produit = await Produit.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );
        await Historique.create({
            action: "MODIFICATION",
            produitId: produit._id,
            ancienneValeur: ancienProduit.toObject(),
            nouvelleValeur: produit.toObject()
        });

        res.status(200).json({
            message: "Produit modifié avec succès",
            produit
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// ======================
// DELETE
// ======================
router.delete("/:id", async (req, res) => {

    try {

        const produit = await Produit.findById(req.params.id);
        
        if (!produit) {
            return res.status(404).json({
                message: "Produit introuvable"
            });
        }

        await Produit.findByIdAndDelete(req.params.id);

        await Historique.create({
            action: "SUPPRESSION",
            produitId: produit._id,
            ancienneValeur: produit.toObject()
        });
        res.status(200).json({
            message: "Produit supprimé avec succès"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

export default router;