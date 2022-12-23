const urlPageProduits = "./product.html?id=";
const urlScriptHelpers = "../js/helpers.js";

const blocProduits = document.querySelector('#items');

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

// Avant tout appel dépendant des fonctions du fichier helpers.js,
// il est nécessaire de s'assurer qu'il est complètement injecté dans la page.
loadExternalScript(urlScriptHelpers).then(() => {

    getInfosProduits().then((produits) => {
        for(let produit of produits) {
            appendProductToPage(produit);
        }
    });

})