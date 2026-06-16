import express from "express";
import Historique from "../models/Historique.js";

const router = express.Router();


// Liste complète
router.get("/", async (req, res) => {

    try {

        const historiques = await Historique.find()
            .sort({ dateAction: -1 });

        res.status(200).json(historiques);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// Historique par ID
router.get("/:id", async (req, res) => {

    try {

        const historique = await Historique.findById(
            req.params.id
        );

        if (!historique) {
            return res.status(404).json({
                message: "Historique introuvable"
            });
        }

        res.status(200).json(historique);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

export default router;