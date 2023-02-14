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
 * Met à jour le code HTML (Carte produit) avec les informations produits contenues dans l'objet spécifié.
 * Est executé de manière parallèle (Asynchrone) pour optimiser le chargement des éléments de la page
 * @param {Object} objetProduit - objet contenant les informations relatives au produit
 * @returns {void}
 */
async function appendProductToPage(objetProduit) {
    const nodeLien = document.createElement("a");
    const nodeArticle = document.createElement("article");
    const nodeHeader = document.createElement("h3");
    const nodeImg = document.createElement("img");
    const nodeParagraphe = document.createElement("p");

    nodeHeader.className = "productName";
    nodeParagraphe.className = "productDescription";

    nodeLien.href = "./product.html?id="+objetProduit._id;
    nodeImg.src = objetProduit.imageUrl;
    nodeImg.alt = objetProduit.altTxt;

    nodeHeader.textContent = objetProduit.name
    nodeParagraphe.textContent = objetProduit.description;

    nodeArticle.append(nodeImg);
    nodeArticle.append(nodeHeader);
    nodeArticle.append(nodeParagraphe);

    nodeLien.append(nodeArticle);

    document.querySelector('#items').append(nodeLien);

}

// Avant tout appel dépendant des fonctions du fichier helpers.js,
// il est nécessaire de s'assurer qu'il est complètement injecté dans la page.
loadExternalScript("../js/helpers.js").then(() => {

    getInfosProduits().then((produits) => {
        for(let produit of produits) {
            appendProductToPage(produit);
        }
    });

})