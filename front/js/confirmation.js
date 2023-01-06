const urlScriptHelpers = "../js/helpers.js";

async function loadExternalScript(url) {
    return new Promise(function(resolve, reject) {
        var script = document.createElement("script");
        script.src = url;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Erreur au chargement de: ${url}!`));
        document.body.appendChild(script);
    });
}


// Avant tout appel dépendant des fonctions du fichier helpers.js,
// il est nécessaire de s'assurer qu'il est complètement injecté dans la page.
loadExternalScript(urlScriptHelpers).then(() => {
    const idCommande = getUrlParametre(window.location.href, "id");
    document.getElementById('orderId').innerText = idCommande;
});