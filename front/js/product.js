// Un seul bloc imbriquant l'image produit est présent dans la page.
// En l'état actuel, le sélecteur de ce bloc sera donc le premier noeud possédant
// la classe "item__img"
const nodeImageProduit = document.getElementsByClassName('item__img')[0];

const nodeTitreProduit = document.getElementById('title');
const nodePrixProduit = document.getElementById('price');
const nodeDescriptionProduit = document.getElementById('description');
const nodeSelectBoxCouleurProduit = document.getElementById('colors');
const nodeButtonAddToCart = document.getElementById('addToCart');

const nodeQuantity = document.getElementsByName("itemQuantity");

const urlActuelle = window.location.href;

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

async function getInfosProduit(id) {
    let reponse = await fetch(`http://localhost:3000/api/products/${id}`);

    if (reponse.ok) {
        let resultat = await reponse.json();
        console.log(resultat);
        return resultat;
    }
    else {
        return false;
    }
}

function creerArticlePanier(id, couleur, quantite, panier){
    return panier[`${id}-${couleur}`] = {
        'id' : id,
        'couleur' : couleur,
        'quantite' : quantite
    };
}

function checkArticlesPanier(id, couleur, panier){
    for(article of panier){
        if(article.id === id && article.couleur === couleur){
            return true;
        }
    }
    return false;
}

function ajoutPanier(id) {
    let couleurChoisie = nodeSelectBoxCouleurProduit.value;
    let quantiteChoisie = nodeQuantity.value;

    if(couleurChoisie === "" || quantiteChoisie === "0") {
        return window.alert('Merci de sélectionner une couleur et une quantité de canapé.');
    }

    let panier = localStorage.getItem('panier');

    if(panier === null) {
        panier = localStorage.setItem('panier', {});
        creerArticlePanier(id, couleurChoisie, quantiteChoisie, panier);
    }
    else{
        if (checkArticlesPanier(id, couleurChoisie, panier) === true){
            panier[`${id}-${couleurChoisie}`].quantite = panier[`${id}-${couleurChoisie}`].quantite + quantiteChoisie;
        }
        else{
            creerArticlePanier(id, couleurChoisie, quantiteChoisie, panier);
        }
    }
    console.log(panier);
}

nodeButtonAddToCart.disabled = true;

let idProduit = getUrlParametre(urlActuelle, "id");

getInfosProduit(idProduit).then((informations) => {
    nodeButtonAddToCart.disabled = false;
    console.log('objet: '+informations);
    appendProductInfosToPage(informations);
    nodeButtonAddToCart.addEventListener('click', ajoutPanier(idProduit));
});