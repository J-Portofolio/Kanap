// Série de constantes / fonctions pouvant être réutilisées depuis n'importe quelle page du site incluant le présent fichier.

const _URL_RACINE = 'http://localhost:3000';

const URL_API_PRODUIT_TOUS = `${_URL_RACINE}/api/products`;
const URL_API_COMMANDE = `${URL_API_PRODUIT_TOUS}/order`;

// Objet faisant office de dictionnaire Anglais Français
const DICT_EN_TO_FR = {
    "colors" : {
        "Black" : "Noir",
        "Blue" : "Bleu",
        "Black/Red" : "Noir/Rouge",
        "Black/Yellow" : "Noir/Jaune",
        "Brown" : "Marron",
        "Green" : "Vert",
        "Grey" : "Gris",
        "Navy" : "Bleu marine",
        "Orange" : "Orange", //Orange est inclut afin de raccourcir l'itération et d'épargner l'utilisation d'un test d'égalité spécifique
        "Pink" : "Rose",
        "Purple" : "Violet",
        "Red" : "Rouge",
        "Silver" : "Argent",
        "White" : "Blanc",
        "Yellow" : "Jaune"
    }
}

/**
 * Traduit les couleurs Anglaises en Français.
 * Retourne la couleur Anglaise si elle n'existe pas dans l'objet dictionnaire
 * @param {String} Encolor 
 * @returns {String} couleur traduite en Français ou couleur à traduire
 */
function couleurEnToFr(Encolor) {
    const couleurFr = DICT_EN_TO_FR.colors[Encolor];
    if(typeof couleurFr === undefined) {
        return Encolor;
    }
    else {
        return couleurFr;
    }
}

/**
 * Analyse une url et retourne la valeur de son paramètre.
 * @param {String} url - url avec son/ses paramètre(s)
 * @param {String} parametre - paramètre dont la valeur est à extraire
 * @returns {String} valeur du pramamètre d'url
 */
function getUrlParametre(url, parametre){
    let urlObject = new URL(url);
    return urlObject.searchParams.get(parametre);
}

/**
 * Obtient, à un instant T, l'objet spécifié dans localStorage
 * Retourne son contenu sous forme de tableau ou un nouveau tableau si l'objet n'existe pas.
 * @param {String} cle - nom de l'objet contenu dans localStorage
 * @returns {Array} objet converti en tableau ou nouveau tableau
 */
function getLocalStorageObject(cle) {
    if (localStorage.getItem(cle) === null) {
        return new Array;
    }
    else {
        return JSON.parse(localStorage.getItem(cle));
    }
}

/**
 * Effectue une requête fetch asynchrone et retourne la réponse en cas de succès
 * Retourne false si l'appel échoue
 * @param {String} url - url de l'API
 * @param {String} methode - méthode de requête ('GET' si non définie)
 * @param {Object} objet - corps de la requête si la méthode est 'POST'
 * @returns {(JSON|Boolean)} objet JSON si la requête réussit ou boolean false si elle échoue
 */
async function callApi(url, methode = 'GET', objet = null) {
    let reponse;

    if (methode === 'POST') {
        reponse = await fetch(url, {
            method: methode,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(objet)
        });
    }
    else {
        reponse = await fetch(url, {
            method: methode
        });
    }

    if(reponse.ok) {
        return await reponse.json();
    }
    else {
        return false;
    }

}

/**
 * Récupère les informations de tous les produits via API.
 * Si un id produit est passé en paramètre, récupère les informations de ce produit.
 * @param {String} id - id du produit
 * @returns {callApi} Appel de la fonction callApi vers l'API produit
 */
async function getInfosProduits(id = null) {
    let url = `${URL_API_PRODUIT_TOUS}`;

    if (typeof id === 'string') {
        url = `${URL_API_PRODUIT_TOUS}/${id}`;
    }

    return callApi(url);
}