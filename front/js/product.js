const nodeSelectBoxCouleurProduit = document.getElementById('colors');
const nodeButtonAddToCart = document.getElementById('addToCart');
const nodeTitreProduit = document.getElementById('title');

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
 * Met à jour le code HTML (Infos page produit) avec les informations produits contenues dans l'objet spécifié
 * @param {Object} objetProduit - objet contenant les informations relatives au produit
 * @returns {void}
 */
function appendProductInfosToPage(objetProduit){
    const nodeImg = `<img src="${objetProduit.imageUrl}" alt="${objetProduit.altTxt}">`;

    /**
     * Un seul bloc imbriquant l'image produit est présent dans la page.
     * En l'état actuel, le sélecteur de ce bloc sera donc le premier noeud possédant
     * la classe "item__img"
     */
    document.getElementsByClassName('item__img')[0].innerHTML = nodeImg;
    nodeTitreProduit.innerText = objetProduit.name;
    document.getElementById('price').innerText = objetProduit.price;
    document.getElementById('description').innerText = objetProduit.description;

    for(color of objetProduit.colors) {
        nodeSelectBoxCouleurProduit.innerHTML += `<option value="${color}">${couleurEnToFr(color)}</option>`;
    }
}

/**
 * Ajoute l'article dans l'objet 'panier' du localStorage s'il n'est pas encore présent.
 * Si l'article est déjà présent dans l'objet 'panier', met à jour sa valeur de clé 'quantité' (addition)
 * @param {Object} nouvelArticle - objet contenant l'id, la couleur et la quantité d'un article
 * @returns {void}
 */
function ajoutPanier(nouvelArticle){
    let articles = getLocalStorageObject('panier');
    let dejaAjoute = false;

    articles.forEach(function (article) {
        if (article.id === nouvelArticle.id && article.couleur === nouvelArticle.couleur) {
            article.quantite = article.quantite + nouvelArticle.quantite;
            dejaAjoute = true;
        }
    });

    if (dejaAjoute === false) {
        articles.push(nouvelArticle);
    }

    localStorage.setItem('panier', JSON.stringify(articles));
}

document.title = 'Chargement de votre produit';
nodeButtonAddToCart.disabled = true;

// Avant tout appel dépendant des fonctions du fichier helpers.js,
// il est nécessaire de s'assurer qu'il est complètement injecté dans la page.
loadExternalScript("../js/helpers.js").then(() => {
    const idProduit = getUrlParametre(window.location.href, "id");

    document.querySelector('.item__content__addButton').insertAdjacentHTML('afterend','<p id="confirmationAjout" style="text-align: center;"></p>');

    nodeButtonAddToCart.addEventListener('click', function () {
        const couleurChoisie = nodeSelectBoxCouleurProduit.value;

        //Un seul noeud HTML de type input pour la quantité est présent sur la page, l'index 0 du sélecteur est donc utilisé
        const quantiteChoisie = Number(document.getElementsByName("itemQuantity")[0].value);
    
        if(couleurChoisie === "" || quantiteChoisie < 1) {
            return window.alert('Merci de sélectionner une couleur et une quantité de canapé.');
        }
        else{
            const nodeConfirmationAjout = document.querySelector('#confirmationAjout');
            const article = {
                "id": idProduit,
                "couleur": couleurChoisie,
                "quantite": quantiteChoisie
            };

            // Réinitialisation et affichage pendant 3 secondes d'un récapitulatif du produit ajouté
            nodeConfirmationAjout.innerText = '';
            ajoutPanier(article);
            nodeConfirmationAjout.innerText = `${quantiteChoisie} ${nodeTitreProduit.innerText} ${quantiteChoisie === 1 ? 'a été ajouté' : 'ont été ajoutés'} au panier`;
            setTimeout(() => {
                nodeConfirmationAjout.innerText = '';
            }, "3000");
        }
    }, false);

    getInfosProduits(idProduit).then((produit) => {
        document.title = produit.name;
        nodeButtonAddToCart.disabled = false;
        appendProductInfosToPage(produit);
    });
})