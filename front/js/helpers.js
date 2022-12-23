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

// Fonction permettant de traduire les couleurs Anglaises retournées par l'Api
function couleurEnToFr(Encolor) {
    let couleurFr = DICT_EN_TO_FR.colors[Encolor];
    if(typeof couleurFr === undefined) {
        return Encolor;
    }
    else {
        return couleurFr;
    }
}

function getUrlParametre(url, parametre){
    let urlObject = new URL(url);
    return urlObject.searchParams.get(parametre);
}

function getLocalStorageObject(cle) {
    if (localStorage.getItem(cle) === null) {
        return new Array;
    }
    else {
        return JSON.parse(localStorage.getItem(cle));
    }
}

async function callApi(url, methode = 'GET', objet = null) {
    let reponse = await fetch(url, {
        method: methode,
        objet
    });

    if (reponse.ok) {
        let resultat = await reponse.json();
        return resultat;
    }
    else {
        return false;
    }
}

async function getInfosProduits(id = null) {
    let url = `${URL_API_PRODUIT_TOUS}`;

    if (typeof id === 'string') {
        url = `${URL_API_PRODUIT_TOUS}/${id}`;
    }

    const infos = await callApi(url);
    return infos;
}