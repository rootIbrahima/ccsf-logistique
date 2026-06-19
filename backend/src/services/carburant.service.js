const { CONSO_PAR_KM, PRIX_LITRE_DEFAUT } = require('../constants/fuel')

function calculerDotation(distanceKm, prixLitre = PRIX_LITRE_DEFAUT) {
  const litresRaw      = distanceKm * CONSO_PAR_KM
  const litresTheo     = Math.ceil(litresRaw / 5) * 5  // arrondi supérieur au multiple de 5
  const dotationTotale = litresTheo * prixLitre
  return { litresTheo, dotationBrute: dotationTotale, margeFcfa: 0, dotationTotale }
}

function calculerStatut(ecartLitres) {
  if (ecartLitres <= 0) return 'OK'
  return 'DANS_MARGE'
}

module.exports = { calculerDotation, calculerStatut }
