// pages/api/upload.js

import { promises as fs } from 'fs';
import path from 'path';
import formidable from 'formidable';

// Désactiver le body parser par défaut de Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }

  const form = formidable({
    multiples: false,
    uploadDir: path.join(process.cwd(), 'public', 'images'),
    keepExtensions: true,
    filename: (name, ext, part) => {
      return `${Date.now()}-${part.originalFilename}`;
    },
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Erreur lors de l\'upload du fichier :', err);
      return res.status(500).json({ success: false, message: 'Erreur lors de l\'upload du fichier.' });
    }

    const file = files.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier fourni.' });
    }

    // Valider le type de fichier (optionnel mais recommandé)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      // Supprimer le fichier téléchargé
      await fs.unlink(file.filepath);
      return res.status(400).json({ success: false, message: 'Type de fichier non autorisé.' });
    }

    // Valider la taille du fichier (optionnel mais recommandé)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      await fs.unlink(file.filepath);
      return res.status(400).json({ success: false, message: 'Fichier trop volumineux.' });
    }

    // Construire l'URL publique de l'image
    const imageUrl = `/images/${path.basename(file.filepath)}`;

    return res.status(200).json({ success: true, url: imageUrl });
  });
}
