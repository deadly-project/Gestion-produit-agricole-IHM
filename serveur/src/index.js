import express from "express";
import cors from "cors";
import "dotenv/config";

import { connection } from "./configuration/connection.js";
import produitRoutes from "./routes/produitRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

connection(process.env.MONGO_URI);

app.use("/api/produits", produitRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});