const BlocProduits = document.querySelector('#items');
const urlPageProduits = "./product.html?id=";

function appendProductToPage(objetProduit) {
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

    BlocProduits.append(nodeLien);

}

async function getProduits() {
    let reponse = await fetch('http://localhost:3000/api/products');

    if (reponse.ok) {
        let resultats = await reponse.json();
        console.log(resultats);
        for(resultat of resultats) {
            appendProductToPage(resultat);
        }
    }
    else {
        return false;
    }
}

getProduits();