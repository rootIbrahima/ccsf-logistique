const CONSO_PAR_KM      = 0.53   // litres par kilomètre — taux fixe tous véhicules
const PRIX_LITRE_DEFAUT = Number(process.env.PRIX_LITRE_DEFAUT) || 680

module.exports = { CONSO_PAR_KM, PRIX_LITRE_DEFAUT }
