import { ERROR_KEYS } from "./errorKeys";

export const translations = {
    [ERROR_KEYS.PRODUCT_TITLE_TOO_SHORT]: "titre trop court",
    [ERROR_KEYS.PRODUCT_PRICE_TOO_LOW]: "le prix doit être supérieur à 0",
    [ERROR_KEYS.PRODUCT_PRICE_TOO_HIGH]: "le prix doit être inférieur à 10000",
    [ERROR_KEYS.PRODUCT_NOT_FOUND]: "produit non trouvé",
    [ERROR_KEYS.PRODUCT_SAVE_ERROR]: "Erreur lors de la sauvegarde du produit",
    [ERROR_KEYS.PRODUCT_FETCH_ERROR]: "Erreur lors de la récupération des produits",
    [ERROR_KEYS.PRODUCT_UPDATE_ERROR]: "Erreur lors de la mise à jour du produit",
    [ERROR_KEYS.PRODUCT_DELETE_ERROR]: "Erreur lors de la suppression du produit",
    [ERROR_KEYS.ORDER_PRICE_TOO_HIGH]: "le prix par commande doit être inférieur à 200€",
    [ERROR_KEYS.ORDER_SAVE_ERROR]: "Erreur lors de la sauvegarde de la commande",
    [ERROR_KEYS.ORDER_NOT_FOUND]: "commande non trouvée",
    [ERROR_KEYS.REPOSITORY_ERROR]: "erreur interne du repository",
};
