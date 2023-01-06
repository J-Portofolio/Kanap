const conteneurArticles = document.getElementById('cart__items');
const conteneurFormulaire = document.querySelector('form.cart__order__form');

const conteneurTotauxPanier = document.querySelector('.cart__price');
const conteneurQuantiteTotalePanier = document.getElementById('totalQuantity');
const conteneurPrixTotalPanier = document.getElementById('totalPrice');

const urlScriptHelpers = "../js/helpers.js";

// On commente !
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

function modifierPanier(id, couleur, quantite){
    let articles = getLocalStorageObject('panier');

    articles.forEach(function (article) {
        if (article.id === id && article.couleur === couleur) {
            console.log("article trouvé");
            if (parseInt(quantite) === 0) {
                console.log("quantité à zéro");
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

function validationChamp(elementInput) {
    let message = '';

    // Vérification de true car retourné par les contraintes de validation de champ de formulaire
    // si l'un des états testés est avéré.
    switch(true) {
        case elementInput.value.trim().length < 1:
            console.log("Valeur manquante: "+elementInput.name);
            message = 'Ce champ est requis';
            break;

        case elementInput.validity.typeMismatch:
            if (elementInput.type === 'email') {
                console.log("Format incorrect: "+elementInput.name);
                message = 'L\'adresse email doit être au format "exemple@exemple.domaine"';
            }
            break;

        case elementInput.name === 'firstName' || elementInput.name === 'lastName' || elementInput.name === 'city':
            if(/^[a-zA-Z\u0080-\u024F\s\-\`\']+$/.test(elementInput.value) === false){
                message = 'Ce champ ne doit contenir que des lettres (Apostrophes et tirets autorisés)';
            }
            break;

        case elementInput.name === 'address':
            console.log(elementInput.name);
            if(/^[0-9].+[a-zA-Z\u0080-\u024F\s\-\`\']+$/.test(elementInput.value) === false){
                message = 'L\'adresse doit commencer par un numéro de voie et terminer par un nom de voie';
            }
            break;
    }

    document.getElementById(`${elementInput.name}ErrorMsg`).innerText = message;
}

// Déclaration de fonction de promesse systématiquement nécessaire.
// Pour oeuvrer selon les rêgles du projet (Code Javascript Pur / Pas d'utilisation de Framework donc pas d'utilisation de la partie back),
// l'import de fonctions réutilisables est effectué via une promesse sur la partie front et via la partie front.
async function loadExternalScript(url) {
    return new Promise(function(resolve, reject) {
        var script = document.createElement("script");
        script.src = url;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Erreur au chargement de: ${url}!`));
        document.body.appendChild(script);
    });
}

async function calculPanier(){
    let prixTotalPanier = 0;
    let quantiteTotalePanier = 0;

    conteneurTotauxPanier.style.display = 'none';
    const cartesArticles = conteneurArticles.getElementsByClassName('cart__item');

    for(let carteArticle of cartesArticles) {
        // Le prix unitaire de l'article est obtenu via API.
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
    conteneurQuantiteTotalePanier.innerText = quantiteTotalePanier;
    conteneurPrixTotalPanier.innerText = prixTotalPanier;

    conteneurTotauxPanier.style.display = 'block';
}

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
    console.log(objetCommande);

    const numeroCommande = await callApi(URL_API_COMMANDE, 'POST', objetCommande);
    return numeroCommande;
}

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
        console.log(tableauIdProduits);
        commande(conteneurFormulaire, tableauIdProduits).then((reponse) => {
            if (reponse === false) {
                console.log("C'est non !");
            }
            else {
                document.location.href =`confirmation.html?id=${reponse.orderId}`;
            }
        });
    }
});

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

    // L'écoute d'évènement est assignée au conteneur des articles du panier car les entrées enfant sont dynamiques
    // Cela permet d'obtenir les informations voulues en toute circonstance.
    // Dans ce contexte, une écoute du changement de la valeur de quantité ainsi que que du clic sur le bouton "supprimer"
    // a été utilisée de manière distincte pour rester spécifique à la nature du contrôle utilisé (Changement de valeur et pression d'un bouton)
    conteneurArticles.addEventListener("change", function(evenement) {
        if (evenement.target.name === "itemQuantity") {
            // Le noeud HTML de type "article" parent de la quantité / suppression cliquée  sera utilisée comme "point de référence"
            // afin d'établir les sélecteurs suivants
            const conteneurArticle = evenement.target.closest('article.cart__item');
            const donneesArticle = evenement.target.closest('article.cart__item').dataset;
            const quantiteArticle = evenement.target.value;

            modifierPanier(donneesArticle.id, donneesArticle.color, quantiteArticle);
            const panier = getLocalStorageObject('panier');

            if (parseInt(quantiteArticle) === 0) {
                conteneurArticle.remove();
            }

            if(panier.length > 0) {
                calculPanier();
            }
            else {
                document.querySelector('#cartAndFormContainer h1').innerHTML = 'Votre panier est vide';
                document.querySelector('section.cart').style.display = 'none';
            }
        }
    });

    conteneurArticles.addEventListener("click", function(evenement) {
        if (evenement.target.className === "deleteItem") {
            const conteneurArticle = evenement.target.closest('article.cart__item');
            const donneesArticle = conteneurArticle.dataset;

            modifierPanier(donneesArticle.id, donneesArticle.color, 0);
            const panier = getLocalStorageObject('panier');
            
            conteneurArticle.remove();

            if(panier.length > 0) {
                calculPanier();
            }
            else {
                document.querySelector('#cartAndFormContainer h1').innerHTML = 'Votre panier est vide';
                document.querySelector('section.cart').style.display = 'none';
            }
        }
    });
})