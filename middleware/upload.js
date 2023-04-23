const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// Configuration
const storage = multer.diskStorage({
  // Enregistrement des fichiers dans le dossier images
  destination: (req, file, callback) => {
    callback(null, 'images');
  },

  // Nom des images => nom d'origine, remplacement des espaces et des points par des underscores, ajout d'un timestamp
  filename: (req, file, callback) => {
    const name = file.originalname.replace(/[\s.]+/g, '_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

// Gestion des téléchargements de fichiers image uniquement
module.exports = multer({storage: storage}).single('image');

// Redimensionnement de l'image
module.exports.resizeImage = (req, res, next) => {
  // On vérifie si un fichier a été téléchargé
  if (!req.file) {
    return next();
  }

  const filePath = req.file.path;
  const fileName = req.file.filename;
  const outputFilePath = path.join('images', `resized_${fileName}`);

  sharp(filePath)
    .resize({ width: 206, height: 260 })
    .toFile(outputFilePath)
    .then(() => {
      // Remplacer le fichier original par le fichier redimensionné
      fs.unlink(filePath, () => {
        req.file.path = outputFilePath;
        next();
      });
    })
    .catch(err => {
      console.log(err);
      return next();
    });
};
