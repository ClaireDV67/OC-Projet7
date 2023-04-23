# Mon vieux Grimoire

Projet n°7 de la formation Développeur Web OpenClassrooms

![Banner](/imagesreadme/16654934257102_DW-P7-Back-end_company-banner.png)


## Contexte

Je suis développeur back-end en freelance depuis maintenant un an dans la région de Lille. J'ai l’habitude de travailler avec Kévin, un développeur front-end plus expérimenté que moi, et qui a déjà un bon réseau de contacts dans le milieu.  

Kévin me contacte pour me proposer de travailler avec lui en mutualisant nos compétences front / back sur un tout nouveau projet qui lui a été proposé. Il s’agit d’une petite chaîne de librairies qui souhaite ouvrir un site de référencement et de notation de livres.  


## Objectif

Développer le back-end du site


## Spécifications de l'API

![spec1](/imagesreadme/spec1.png)

![spec2](/imagesreadme/spec2.png)


## API Errors

Les erreurs éventuelles doivent être renvoyées telles qu'elles se sont produites, sans modification ni ajout. Si nécessaire, utilisez une nouvelle Error().


## API Routes

Toutes les routes pour les livres doivent disposer d’une autorisation (le token est envoyé par le front-end avec l'en-tête d’autorisation « Bearer »). Avant qu’un utilisateur puisse apporter des modifications à la route livre (book), le code doit vérifier si le user ID actuel correspond au user ID du livre. Si le user ID ne correspond pas, renvoyer « 403: unauthorized request ». Cela permet de s'assurer que seul le propriétaire d’un livre puisse apporter des modifications à celui-ci.


## Models

User {  
    email : String - adresse e-mail de l’utilisateur [unique]  
    password : String - mot de passe haché de l’utilisateur  
}

Book {  
    userId : String - identifiant MongoDB unique de l'utilisateur qui a créé le livre  
    title : String - titre du livre  
    author : String - auteur du livre  
    imageUrl : String - illustration/couverture du livre  
    year: Number - année de publication du livre  
    genre: String - genre du livre  
    ratings : [  
        {  
            userId : String - identifiant MongoDB unique de l'utilisateur qui a noté le livre  
            grade : Number - note donnée à un livre  
        }  
    ] - notes données à un livre  
    averageRating : Number - note moyenne du livre  
}


## Sécurité

- Le mot de passe de l'utilisateur doit être haché.
- L'authentification doit être renforcée sur toutes les routes livre (book) requises.
- Les adresses électroniques dans la base de données sont uniques, et un plugin Mongoose approprié est utilisé pour garantir leur unicité et signaler les erreurs.
- La sécurité de la base de données MongoDB (à partir d'un service tel que MongoDB Atlas) ne doit pas empêcher l'application de se lancer sur la machine d'un utilisateur.
- Les erreurs issues de la base de données doivent être remontées.
