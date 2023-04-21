const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Schéma User
const userSchema = mongoose.Schema({
    // Vérification de l'unicité de l'e-mail dans la base de données
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator);

// On exporte le modèle comme modèle réutilisable
module.exports = mongoose.model('User', userSchema);