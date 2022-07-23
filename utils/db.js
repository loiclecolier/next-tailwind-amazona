// npm install mongoose
import mongoose from 'mongoose';

// pour obtenir les infos de connexion
const connection = {};

async function connect() {
  // vérifie si déjà connecté
  if (connection.isConnected) {
    console.log('already connected');
    return; // on sort de la fonction
  }
  // vérifie s'il y a des connexions à faire (dans la "connexion queue")
  if (mongoose.connections.length > 0) {
    // on récupère le readyState de la première connexion de Mongoose
    connection.isConnected = mongoose.connections[0].readyState;
    // si connection.isConnected = 1, on est connecté depuis la connexion précédente
    if (connection.isConnected === 1) {
      console.log('use previous connection');
      return; // on sort de la fonction
    }
    // si connection.isConnected = 0, on est pas dans un cas de connexion, donc on déconnecte
    await mongoose.disconnect();
  }

  // Dans les autres cas, on se connecte :
  const db = await mongoose.connect(process.env.MONGODB_URI);
  console.log('new connection');
  connection.isConnected = db.connections[0].readyState;
}

async function disconnect() {
  // si connecté
  if (connection.isConnected) {
    // si on est en production (car on ne déconnecte pas en développement car les changements dans le code consomment)
    if (process.env.NODE_ENV === 'production') {
      // deconnexion
      await mongoose.disconnect();
      connection.isConnected = false;
    } else {
      console.log('not disconnected');
    }
  }
}

// convertit ce qu'on reçoit de la base de données (MongoDB) du 'Doc', en objet JavaScript
function convertDocToObj(doc) {
  // convertit l'ID de chaque doc en String
  doc._id = doc._id.toString();
  // convertit le champ createdAt (s'il existe) en String
  doc.createdAt = doc.createdAt.toString();
  // convertit le champ updatedAt (s'il existe) en String
  doc.updatedAt = doc.updatedAt.toString();
  // on retourne le doc converti
  return doc;
}

const db = { connect, disconnect, convertDocToObj };
export default db;
