const urlActuelle = window.location.href;
const urlScriptHelpers = "../js/helpers.js";

// Un seul bloc imbriquant l'image produit est présent dans la page.
// En l'état actuel, le sélecteur de ce bloc sera donc le premier noeud possédant
// la classe "item__img"
const nodeImageProduit = document.getElementsByClassName('item__img')[0];

// Idem pour le sélecteur de noeuds par nom
const nodeQuantity = document.getElementsByName("itemQuantity")[0];

const nodeTitreProduit = document.getElementById('title');
const nodePrixProduit = document.getElementById('price');
const nodeDescriptionProduit = document.getElementById('description');
const nodeSelectBoxCouleurProduit = document.getElementById('colors');
const nodeButtonAddToCart = document.getElementById('addToCart');

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

function appendProductInfosToPage(objetProduit){
    let nodeImg = `<img src="${objetProduit.imageUrl}" alt="${objetProduit.altTxt}">`;

    nodeImageProduit.innerHTML = nodeImg;
    nodeTitreProduit.innerText = objetProduit.name;
    nodePrixProduit.innerText = objetProduit.price;
    nodeDescriptionProduit.innerText = objetProduit.description;

    for(color of objetProduit.colors) {
        let couleurTraduite = couleurEnToFr(color);
        let nodeOption = `<option value="${color}">${couleurTraduite}</option>`;

        nodeSelectBoxCouleurProduit.innerHTML += nodeOption;
    }
}

function creerArticle(id, couleur, quantite) {
    let objetArticle = {
        "id": id,
        "couleur": couleur,
        "quantite": quantite
    };

    return objetArticle;
}

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

nodeButtonAddToCart.disabled = true;

// Avant tout appel dépendant des fonctions du fichier helpers.js,
// il est nécessaire de s'assurer qu'il est complètement injecté dans la page.
loadExternalScript(urlScriptHelpers).then(() => {
    const idProduit = getUrlParametre(urlActuelle, "id");

    document.querySelector('.item__content__addButton').insertAdjacentHTML('afterend','<p id="confirmationAjout" style="text-align: center;"></p>');

    nodeButtonAddToCart.addEventListener('click', function () {
        let couleurChoisie = nodeSelectBoxCouleurProduit.value;
        let quantiteChoisie = parseInt(nodeQuantity.value);
    
        if(couleurChoisie === "" || quantiteChoisie < 1) {
            return window.alert('Merci de sélectionner une couleur et une quantité de canapé.');
        }
        else{
            document.querySelector('#confirmationAjout').innerText = '';
            let article = creerArticle(idProduit, couleurChoisie, quantiteChoisie);
            ajoutPanier(article);
            document.querySelector('#confirmationAjout').innerText = `${quantiteChoisie} ${nodeTitreProduit.innerText} ${quantiteChoisie === 1 ? 'a été ajouté' : 'ont été ajoutés'} au panier`;
            setTimeout(() => {
                document.querySelector('#confirmationAjout').innerText = '';
            }, "3000");
        }
    }, false);

    getInfosProduits(idProduit).then((produit) => {
        nodeButtonAddToCart.disabled = false;
        appendProductInfosToPage(produit);
    });
})