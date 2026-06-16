import {mongoose} from "mongoose";

export function connection(uri){
    mongoose.connect(uri);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'Erreur de connexion avec MongoDB:'));
    db.once('open', () => {
      console.log('Connexion à MongoDB réussie');
    });
}