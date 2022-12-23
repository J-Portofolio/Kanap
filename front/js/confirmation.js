

const urlScriptHelpers = "../js/helpers.js";

// Avant tout appel dépendant des fonctions du fichier helpers.js,
// il est nécessaire de s'assurer qu'il est complètement injecté dans la page.
loadExternalScript(urlScriptHelpers).then(() => {

    const panier = getLocalStorageObject('panier');

    if(panier.length > 0) {
        // Un appel API pour chaque article de panier est réalisé pour récupérer les informations nécessaires à l'affichage du contenu de page.
        // Pour optimiser le temps de chargement cumulé, les appels sont ici réalisés en parallèle.
        // Dans ce contexte, une constante contenant les retours (sous forme de promesses) de chaque itération est utilisée.
        const promesses = panier.map(async (article) => getInfosProduits(article.id).then((resultat) => {
                // L'objet retourné par l'API posssède déjà toutes les informations nécessaires.
                // Autant utiliser cet objet en n'y ajoutant que l'ID et la quantité / couleur sélectionnée par le client
                // pour alimenter ensuite le contenu HTML.
                resultat.id = article.id;
                resultat.quantiteChoisie = parseInt(article.quantite);
                resultat.couleurChoisie = article.couleur;
                appendArticleHtml(resultat);
        }));
        
        // La constante peut ensuite être appelée une fois les itérations parallèles achevées.
        Promise.all(promesses).then(() => {

            // Le calcul du panier peut être lancé une fois le contenu html alimenté de façon asynchrone.
            calculPanier();
            document.querySelector('section.cart').style.display = 'block';
            document.querySelector('#cartAndFormContainer h1').innerHTML = 'Votre panier';
        });
    }

    // L'écoute d'évènement est assignée au conteneur des articles du panier car les entrées enfant sont dynamiques
    // Cela permet d'obtenir les informations voulues en toute circonstance.
    // Dans ce contexte, une écoute du changement de la valeur de quantité ainsi que que du clic sur le bouton "supprimer"
    // a été utilisée de manière distincte pour rester spécifique à la nature du contrôle utilisé (Changement de valeur et pression d'un bouton)
    conteneurArticles.addEventListener("change", function(evenement) {
        if (evenement.target.name === "itemQuantity") {
            // Le noeud HTML de type "article" parent de la quantité / suppression cliquée  sera utilisée comme "point de référence"
            // afin d'établir les sélecteurs suivants
            let conteneurArticle = evenement.target.closest('article.cart__item');
            let idArticle = conteneurArticle.dataset.id;
            let couleurArticle = conteneurArticle.dataset.color;
            let quantiteArticle = evenement.target.value;

            modifierPanier(idArticle, couleurArticle, quantiteArticle);
            calculPanier();
        }
    });

    conteneurArticles.addEventListener("click", function(evenement) {
        if (evenement.target.className === "deleteItem") {
            let conteneurArticle = evenement.target.closest('article.cart__item');
            let idArticle = conteneurArticle.dataset.id;
            let couleurArticle = conteneurArticle.dataset.color;
            let quantiteArticle = 0;

            modifierPanier(idArticle, couleurArticle, quantiteArticle);
            conteneurArticle.remove();

            const panier = getLocalStorageObject('panier');
            if(panier.length > 0) {
                calculPanier();
            }
            else {
                document.querySelector('#cartAndFormContainer h1').innerHTML = 'Votre panier est vide';
                document.querySelector('section.cart').style.display = 'none';
            }
        }
    });

    conteneurFormulaire.addEventListener("submit", function(evenement) {
        evenement.preventDefault();
        
    }, true);
})