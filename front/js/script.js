const blocProduits = document.querySelector('#items');

const urlPageProduits = "./product.html?id=";
const urlApiProduits = "http://localhost:3000/api/products";

async function appendProductToPage(objetProduit) {
    let nodeLien = document.createElement("a");
    let nodeArticle = document.createElement("article");
    let nodeHeader = document.createElement("h3");
    let nodeImg = document.createElement("img");
    let nodeParagraphe = document.createElement("p");

    nodeHeader.className = "productName";
    nodeParagraphe.className = "productDescription";

    nodeLien.href = urlPageProduits+objetProduit._id;
    nodeImg.src = objetProduit.imageUrl;
    nodeImg.alt = objetProduit.altTxt;
    nodeParagraphe.textContent = objetProduit.description;

    nodeArticle.append(nodeImg);
    nodeArticle.append(nodeHeader);
    nodeArticle.append(nodeParagraphe);

    nodeLien.append(nodeArticle);

    blocProduits.append(nodeLien);

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

callApi(urlApiProduits).then((produits) => {
    for(produit of produits) {
        appendProductToPage(produit);
    }
});