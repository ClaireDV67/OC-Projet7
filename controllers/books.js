const Book = require('../models/book');
const average = require('../utils/average');
const fs = require('fs');

// Logique métier - Contrôleur

// POST => Enregistrement d'un livre
exports.createBook = (req, res, next) => {
    // Stockage de la requête sous forme de JSON dans une constante (requête sous la forme form-data à l'origine)
    const bookObject = JSON.parse(req.body.book);
    // Suppression du faux _id envoyé par le front
    delete bookObject._id;
    // Suppression de _userId auquel on ne peut faire confiance
    delete bookObject._userId;
    // Création d'une instance du modèle Book
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/resized_${req.file.filename}`,
        averageRating: bookObject.ratings[0].grade
    });
    // Enregistrement dans la base de données
    book.save()
        .then(() => { res.status(201).json({ message: 'Objet enregistré !' }) })
        .catch(error => { res.status(400).json( { error }) })
};

// GET => Récupération d'un livre spécifique
exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
};

// PUT => Modification d'un livre existant
exports.modifyBook = (req, res, next) => {
    // Stockage de la requête en JSON dans une constante
    // (ici, nous recevons soit un élément form-data, soit des données JSON, selon si le fichier image a été modifié ou non)
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/resized_${req.file.filename}` 
    } : { ...req.body };
    // Suppression de _userId auquel on ne peut faire confiance
    delete bookObject._userId;
    // Récupération du livre existant à modifier
    Book.findOne({_id: req.params.id})
        .then((book) => {
            // Le livre ne peut être mis à jour que par le créateur de sa fiche
            if (book.userId != req.auth.userId) {
                res.status(403).json({ message : '403: unauthorized request' });
            } else {
                // Séparation du nom du fichier image existant
                const filename = book.imageUrl.split('/images/')[1];
                // Si l'image a été modifiée, on supprime l'ancienne
                req.file && fs.unlink(`images/${filename}`, (err => {
                        if (err) console.log(err);
                    })
                );
                // Mise à jour du livre
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet modifié !' }))
                    .catch(error => res.status(400).json({ error }));
            }
        })
        .catch((error) => {
            res.status(404).json({ error });
        });
};


// DELETE => Suppression d'un livre
exports.deleteBook = (req, res, next) => {
    // Récupération du livre à supprimer
    Book.findOne({ _id: req.params.id })
        .then(book => {
            // Le livre ne peut être supprimé que par le créateur de sa fiche
            if (book.userId != req.auth.userId) {
                res.status(403).json({ message: '403: unauthorized request' });
            } else {
                // Séparation du nom du fichier image
                const filename = book.imageUrl.split('/images/')[1];
                // Suppression du fichier image puis suppression du livre dans la base de données dans la callback
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
                        .catch(error => res.status(400).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(404).json({ error });
        });
};

// GET => Récupération de tous les livres
exports.getAllBooks = (req, res, next) => {
    // Renvoie un tableau contenant tous les Books de la base de données
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(404).json({ error }));
};

// POST => Création d'une note
exports.createRating = (req, res, next) => {
    // On vérifie que la note est comprise entre 0 et 5
    if (0 <= req.body.rating <= 5) {
        // Stockage de la requête dans une constante
        const ratingObject = { ...req.body, grade: req.body.rating };
        // Suppression du faux _id envoyé par le front
        delete ratingObject._id;
        // Récupération du livre auquel on veut ajouter une note
        Book.findOne({_id: req.params.id})
            .then(book => {
                // Création d'un tableau regroupant toutes les userId des utilisateurs ayant déjà noté le livre en question
                const newRatings = book.ratings;
                const userIdArray = newRatings.map(rating => rating.userId);
                // On vérifie que l'utilisateur authentifié n'a jamais donné de note au livre en question
                if (userIdArray.includes(req.auth.userId)) {
                    res.status(403).json({ message : 'Not authorized' });
                } else {
                    // Ajout de la note
                    newRatings.push(ratingObject);
                    // Création d'un tableau regroupant toutes les notes du livre, et calcul de la moyenne des notes
                    const grades = newRatings.map(rating => rating.grade);
                    const averageGrades = average.average(grades);
                    book.averageRating = averageGrades;
                    // Mise à jour du livre avec la nouvelle note ainsi que la nouvelle moyenne des notes
                    Book.updateOne({ _id: req.params.id }, { ratings: newRatings, averageRating: averageGrades, _id: req.params.id })
                        .then(() => { res.status(201).json()})
                        .catch(error => { res.status(400).json( { error })});
                    res.status(200).json(book);
                }
            })
            .catch((error) => {
                res.status(404).json({ error });
            });
    } else {
        res.status(400).json({ message: 'La note doit être comprise entre 1 et 5' });
    }
};


// GET => Récupération des 3 livres les mieux notés
exports.getBestRating = (req, res, next) => {
    // Récupération de tous les livres
    // Puis tri par rapport aux moyennes dans l'ordre décroissant, limitation du tableau aux 3 premiers éléments
    Book.find().sort({averageRating: -1}).limit(3)
        .then((books)=>res.status(200).json(books))
        .catch((error)=>res.status(404).json({ error }));
};