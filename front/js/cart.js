//const panier = JSON.parse(localStorage.getItem('panier'));
const panier = [
    {
        id : "107fb5b75607497b96722bda5b504926",
        couleur : "Blue",
        quantite : "5"
    },
    {
        id : "107fb5b75607497b96722bda5b504926",
        couleur : "Black",
        quantite : "3"
    },
    {
        id : "415b7cacb65d43b2b5c1ff70f3393ad1",
        couleur : "Yellow",
        quantite : "1"
    }
];


const nodeArticles = document.getElementById('cart__items');
const nodeTotalQuantite = document.getElementById('totalQuantity');
const nodeTotalPrix = document.getElementById('totalPrice');

const urlApiProduit = 'http://localhost:3000/api/products/';

function updatePrixTotal(prix, quantite, node) {

    let prixTotalPanier = node.innerText;

    node.innertext = prixTotalPanier + (prix*quantite);
}

function updateQuantiteTotale(quantite, node) {
    let quantiteTotalePanier = node.innerText;

    node.innerText = quantiteTotalePanier + quantite;
}

function deleteArticle(id){
    return delete panier[id];
}

async function appendArticleToPage(objetArticle, objetProduit){
    let prixtotal = objetArticle.quantite*objetProduit.price;

    let contenu = `
        <article class="cart__item" data-id="${objetArticle.id}" data-color="${objetArticle.couleur}">
            <div class="cart__item__img">
                <img src="${objetProduit.imageUrl}" alt="${objetProduit.altTxt}">
            </div>
            <div class="cart__item__content">
                <div class="cart__item__content__description">
                    <h2>${objetProduit.name}</h2>
                    <p>${objetArticle.couleur}</p>
                    <p>${prixtotal} €</p>
                </div>
                <div class="cart__item__content__settings">
                    <div class="cart__item__content__settings__quantity">
                        <p>Qté : </p>
                        <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${objetArticle.quantite}">
                    </div>
                    <div class="cart__item__content__settings__delete">
                        <p class="deleteItem">Supprimer</p>
                    </div>
                </div>
            </div>
        </article>
    `
    nodeArticles.innerHTML += contenu;
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

async function updatePanierElements(){
    for(article of panier) {
        let urlinfosArticle = urlApiProduit+article.id;
        console.log(article);
        const infosProduit = await callApi(urlinfosArticle);
        console.log(infosProduit);
        appendArticleToPage(article, infosProduit);
        updatePrixTotal(parseInt(infosProduit.price), parseInt(article.quantite), nodeTotalPrix);
        updateQuantiteTotale(parseInt(article.quantite), nodeTotalQuantite);
    }
}

updatePanierElements().then(() => {
    const boutonsSupprimmer = document.querySelectorAll('.deleteItem');

    boutonsSupprimmer.forEach(bouton => bouton.addEventListener('click', function () {
        let prixConcerne = bouton.closest('input[name="itemQuantity"]').innerText;
        let quantiteConcernee = bouton.closest('.cart__item__content__description p:last-child').innerText;
        updatePrixTotal(parseInt(prixConcerne), parseInt(quantiteConcernee), nodeTotalPrix);
        updateQuantiteTotale(parseInt(quantiteConcernee), nodeTotalQuantite);
    }));
});