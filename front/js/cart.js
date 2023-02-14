const conteneurArticles = document.getElementById('cart__items');
const conteneurFormulaire = document.querySelector('form.cart__order__form');

const conteneurTotauxPanier = document.querySelector('.cart__price');

/**
 * Charge le fichier de script javascript spécifié dans le DOM
 * @param {String} url - url ou chemin du fichier au format .js
 * @returns {void}
 */
async function loadExternalScript(url) {
    return new Promise(function(resolve, reject) {
        var script = document.createElement("script");
        script.src = url;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Erreur au chargement de: ${url}!`));
        document.body.appendChild(script);
    });
}

/**
 * Calcule les prix sous-totaux et quantités choisies des articles du panier.
 * Incrémente ensuite ces résultats pour déterminer le prix et le nombre d'articles total du panier
 * Met à jour le contenu HTML de la page avec ces données.
 * Annule le calcul si le panier est vide.
 * @returns {void}
 */
async function calculPanier(){
    const panier = getLocalStorageObject("panier");
    if(panier.length === 0) {
        document.querySelector('#cartAndFormContainer h1').innerHTML = 'Votre panier est vide';
        document.querySelector('section.cart').style.display = 'none';
        return;
    }

    let prixTotalPanier = 0;
    let quantiteTotalePanier = 0;

    conteneurTotauxPanier.style.display = 'none';
    const cartesArticles = conteneurArticles.getElementsByClassName('cart__item');

    for(let carteArticle of cartesArticles) {
        // Utilisation de l'API '/api/products/{id}' pour obtenir le prix unitaire de l'article comme référence de calcul.
        // L'idée est de fournir une information de source fiable sur la pertinence et la sécurité (Le serveur)
        const infosArticle = await getInfosProduits(carteArticle.dataset.id);
        const prixArticle = Number(infosArticle.price);

        // Le seul facteur modifiable par un client est la quantité d'article sélectionnée.
        let quantiteArticle = carteArticle.querySelector('[name="itemQuantity"]').value;
        quantiteArticle = Number(quantiteArticle);

        const sousTotalArticle = prixArticle * quantiteArticle;

        carteArticle.querySelector('.cart__item__content__description p:last-child').innerText = `${sousTotalArticle} €`;

        // Le calcul du prix / quantité total du panier est ainsi réalisé et incrémenté sur une base de 0
        prixTotalPanier += sousTotalArticle;
        quantiteTotalePanier += quantiteArticle;
    }

    // Cela permet de fournir une information correcte au visiteur en toute circonstance
    // (Evolution du prix sur un article, une couleur / promotions etc... )
    document.getElementById('totalQuantity').innerText = quantiteTotalePanier;
    document.getElementById('totalPrice').innerText = prixTotalPanier;

    conteneurTotauxPanier.style.display = 'block';
}

/**
 * Créer un objet réunissant les informations/critères nécessaires pour solliciter
 * l'API '/api/products/order'.
 * Obtient un numéro de commande.
 * @param {Object} formulaire - élément html form
 * @param {Array} tableauID - array des id produit (articles du panier)
 * @returns {JSON} objet JSON contenant le numéro de commande
 */
async function commande(formulaire, tableauID) {

    const objetCommande = {
        contact : {
            firstName : formulaire.firstName.value,
            lastName : formulaire.lastName.value,
            address : formulaire.address.value,
            city : formulaire.city.value,
            email : formulaire.email.value
        },
        products : tableauID
    };
    const numeroCommande = await callApi(URL_API_COMMANDE, 'POST', objetCommande);
    return numeroCommande;
}

/**
 * Met à jour le code HTML (Récap produit ajouté) avec les informations d'article contenues dans l'objet spécifié
 * @param {Object} objetArticle - informations relatives au produit et à l'article panier
 * @returns {void}
 */
function appendArticleHtml(objetArticle){

    // Le sous-total par article est calculé via la fonction calculPanier
    let contenu = `
        <article class="cart__item" data-id="${objetArticle.id}" data-color="${objetArticle.couleurChoisie}">
            <div class="cart__item__img">
                <img src="${objetArticle.imageUrl}" alt="${objetArticle.altTxt}">
            </div>
            <div class="cart__item__content">
                <div class="cart__item__content__description">
                    <h2>${objetArticle.name}</h2>
                    <p>${objetArticle.couleurChoisie}</p>
                    <p></p>
                </div>
                <div class="cart__item__content__settings">
                    <div class="cart__item__content__settings__quantity">
                        <p>Qté : </p>
                        <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${objetArticle.quantiteChoisie}">
                    </div>
                    <div class="cart__item__content__settings__delete">
                        <p class="deleteItem">Supprimer</p>
                    </div>
                </div>
            </div>
        </article>
    `;
    conteneurArticles.insertAdjacentHTML('beforeend', contenu);
}

/**
 * Ajoute l'article dans l'objet 'panier' du localStorage s'il n'est pas encore présent.
 * Si l'article est déjà présent dans l'objet 'panier', met à jour sa valeur de clé 'quantité' (addition)
 * @param {String} id - id de l'article
 * @param {String} couleur - couleur de l'article
 * @param {Number} quantite - quantité sélectionnée pour l'article
 * @returns {void}
 */
function modifierPanier(id, couleur, quantite){
    let articles = getLocalStorageObject('panier');

    articles.forEach(function (article) {
        // La couleur passée en paramètre est la couleur affichée à l'écran (La vf)
        // Pour le test d'égalité, une trad est donc nécessaire.
        if (article.id === id && couleurEnToFr(article.couleur) === couleur) {
            if (quantite === 0) {
                articles.splice(article, 1);
            }
            else{
                article.quantite = quantite;
            }
        }
    });

    if (articles.length === 0) {
        localStorage.removeItem('panier');
    }
    else {
        localStorage.setItem('panier', JSON.stringify(articles));
    }
}

/**
 * Test des contraintes de validation spécifiques pour un champ de formulaire.
 * Affiche un message d'erreur personnalisé sous le champ concerné si une contrainte est vraie.
 * @param {Object} elementInput - élément HTML input
 * @returns {void}
 */
function validationChamp(elementInput) {
    let message = '';

    // Vérification de true car retourné par les contraintes de validation de champ de formulaire
    // si l'un des états testés est avéré.
    switch(true) {
        case elementInput.value.trim().length < 1:
            message = 'Ce champ est requis';
            break;

        case elementInput.validity.typeMismatch:
            if (elementInput.type === 'email') {
                message = 'L\'adresse email doit être au format "exemple@exemple.domaine"';
            }
            break;

        case elementInput.name === 'firstName' || elementInput.name === 'lastName' || elementInput.name === 'city':
            if(/^[a-zA-Z\u0080-\u024F\s\-\`\']+$/.test(elementInput.value) === false){
                message = 'Ce champ ne doit contenir que des lettres (Apostrophes et tirets autorisés)';
            }
            break;

        case elementInput.name === 'address':
            if(/^[0-9].+[a-zA-Z\u0080-\u024F\s\-\`\']+$/.test(elementInput.value) === false){
                message = 'L\'adresse doit commencer par un numéro de voie et terminer par un nom de voie';
            }
            break;
    }

    document.getElementById(`${elementInput.name}ErrorMsg`).innerText = message;
}

document.title = 'Panier';
document.querySelector('#cartAndFormContainer h1').innerHTML = 'Votre panier est vide';
document.querySelector('section.cart').style.display = 'none';

// Désactivation de la validation par défaut, via navigateur, du formulaire
conteneurFormulaire.noValidate = true;

for (const champ of conteneurFormulaire.querySelectorAll("input:not([type='submit'])")) {
    champ.addEventListener('change', function(){
        validationChamp(champ);
    });
}
conteneurFormulaire.addEventListener('submit', function(evenement) {
    evenement.preventDefault();
    
    for (const champ of conteneurFormulaire.querySelectorAll("input:not([type='submit'])")) {
        validationChamp(champ);
    }
    
    if (conteneurFormulaire.checkValidity() === true) {
        const panier = getLocalStorageObject('panier');
        let tableauIdProduits = new Array;

        for (const article of panier) {
            tableauIdProduits.push(article.id);
        }
        commande(conteneurFormulaire, tableauIdProduits).then((reponse) => {
            if (reponse === false) {
                alert('Un problème a été rencontré durant la commande de vos articles. Veuillez vous rapprocher du support.');
            }
            else {
                localStorage.removeItem('panier');
                document.location.href =`confirmation.html?id=${reponse.orderId}`;
            }
        });
    }
});

// Avant tout appel dépendant des fonctions du fichier helpers.js,
// il est nécessaire de s'assurer qu'il est complètement injecté dans la page.
loadExternalScript("../js/helpers.js").then(() => {

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
                resultat.quantiteChoisie = Number(article.quantite);
                resultat.couleurChoisie = couleurEnToFr(article.couleur);
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

    // Les écoutes d'évènement (changement de quantité et clic sur 'suppression') sont assignées au conteneur des articles du panier
    // car les entrées enfant sont dynamiques.
    conteneurArticles.addEventListener("change", function(evenement) {
        if (evenement.target.name === "itemQuantity") {
            // Le noeud HTML de type "article" parent de la quantité / suppression cliquée  sera utilisée comme "point de référence"
            const conteneurArticle = evenement.target.closest('article.cart__item');
            const donneesArticle = conteneurArticle.dataset;
            const quantiteArticle = Number(evenement.target.value);

            modifierPanier(donneesArticle.id, donneesArticle.color, quantiteArticle);

            if (quantiteArticle === 0) {
                conteneurArticle.remove();
            }
            calculPanier();
        }
    });

    conteneurArticles.addEventListener("click", function(evenement) {
        if (evenement.target.className === "deleteItem") {
            const conteneurArticle = evenement.target.closest('article.cart__item');
            const donneesArticle = conteneurArticle.dataset;

            modifierPanier(donneesArticle.id, donneesArticle.color, 0);
            conteneurArticle.remove();
            calculPanier();
        }
    });
})