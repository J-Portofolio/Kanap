const urlActuelle = window.location.href;
const idProduit = getUrlParametre(urlActuelle, "id");
const urlApiProduit = `http://localhost:3000/api/products/${idProduit}`;

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

function getUrlParametre(url, parametre){
    let urlObject = new URL(url);
    return urlObject.searchParams.get(parametre);
}

function appendProductInfosToPage(objetProduit){
    let nodeImg = `<img src="${objetProduit.imageUrl}" alt="${objetProduit.altTxt}">`;

    nodeImageProduit.innerHTML = nodeImg;
    nodeTitreProduit.innerText = objetProduit.name;
    nodePrixProduit.innerText = objetProduit.price;
    nodeDescriptionProduit.innerText = objetProduit.description;

    for(color of objetProduit.colors) {
        let nodeOption = `<option value="${color}">${color}</option>`;
        nodeSelectBoxCouleurProduit.innerHTML += nodeOption;
    }
}

async function callApi(url) {
    let reponse = await fetch(url);

    if (reponse.ok) {
        let resultat = await reponse.json();
        return resultat;
    }
    else {
        return false;
    }
}

function ajouterArticle(idArticle, couleurArticle, quantiteArticle) {
    let panier = JSON.parse(localStorage.getItem('panier')) === null ? localStorage.setItem('panier', JSON.stringify(new Object)) : JSON.parse(localStorage.getItem('panier'));
    let idUnique = `${idProduit}-${couleurChoisie}`;
    console.log(panier);

    if(panier[idUnique]) {
        panier[idUnique].quantite = panier[idUnique].quantite + quantiteArticle;
    }
    else{
        let entree = {};
        entree = {
                [idUnique]: {
                "id": idArticle,
                "couleur": couleurArticle,
                "quantite": quantiteArticle
            }
        };
        localStorage.setItem('panier', entree);
        console.log(panier[idArticle]);
    }
    console.log(panier);
}

nodeButtonAddToCart.disabled = true;
nodeButtonAddToCart.addEventListener('click', function () {

    let couleurChoisie = nodeSelectBoxCouleurProduit.value;
    let quantiteChoisie = parseInt(nodeQuantity.value);

    console.log(quantiteChoisie);

    if(couleurChoisie === "" || quantiteChoisie < 1) {
        return window.alert('Merci de sélectionner une couleur et une quantité de canapé.');
    }
    else{
        return ajouterArticle(idProduit, couleurChoisie, quantiteChoisie); 
    }
}, false);

callApi(urlApiProduit).then((produit) => {
    nodeButtonAddToCart.disabled = false;
    appendProductInfosToPage(produit);
});