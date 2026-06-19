const PDFDocument = require('pdfkit')

function val(v) {
  if (v == null || v === '') return ''
  return String(v)
}

function fmtNum(n) {
  if (n == null) return ''
  return String(Math.round(Number(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function money(n) {
  if (n == null) return ''
  return fmtNum(n) + ' FCFA'
}

function generateFeuilleDeRoutePDF(fdr, res) {
  const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true })

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="FR-${fdr.numero}.pdf"`)
  doc.pipe(res)

  const ML = 40   // margin left
  const MR = 40   // margin right
  const W  = doc.page.width - ML - MR   // usable width
  const col1 = 185  // label column width
  const rowH = 20

  // ─── HEADER ─────────────────────────────────────────────────
  // Bande bleue de titre
  doc.rect(0, 0, doc.page.width, 52).fill('#0D1B3E')

  doc.fillColor('white').fontSize(18).font('Helvetica-Bold')
  doc.text('CCSF', ML, 10)

  doc.fontSize(9).font('Helvetica')
  doc.text('Comptoir Commercial SALL et Frères', ML, 30)

  doc.fontSize(18).font('Helvetica-Bold')
  doc.text('FEUILLE DE ROUTE', 0, 16, { width: doc.page.width, align: 'center' })

  // Sous-bande grise claire
  doc.rect(0, 52, doc.page.width, 26).fill('#F0F4FF')

  doc.fillColor('#0D1B3E').fontSize(10).font('Helvetica-Bold')
  doc.text(`N°  ${fdr.numero}`, ML, 60)

  const dateStr = new Date(fdr.date).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
  doc.fontSize(9).font('Helvetica')
  doc.text(dateStr, 0, 62, { width: doc.page.width - MR, align: 'right' })

  // Statut badge
  const statutColors = {
    EN_ATTENTE: '#d97706', EN_ROUTE: '#3b82f6', LIVRE: '#16a34a', ANNULE: '#dc2626'
  }
  const sColor = statutColors[fdr.statut] || '#6b7280'
  doc.roundedRect(doc.page.width - MR - 90, 55, 90, 18, 4).fill(sColor)
  doc.fillColor('white').fontSize(9).font('Helvetica-Bold')
  doc.text(fdr.statut.replace('_', ' '), doc.page.width - MR - 88, 59, { width: 88, align: 'center' })

  let y = 88

  // ─── SECTION HELPERS ────────────────────────────────────────
  function section(titre) {
    doc.rect(ML, y, W, 17).fill('#0D1B3E')
    doc.fillColor('white').fontSize(9).font('Helvetica-Bold')
    doc.text(titre, ML + 6, y + 4)
    doc.fillColor('black').font('Helvetica')
    y += 17
  }

  function row(label, value, highlight = false) {
    if (highlight) doc.rect(ML, y, W, rowH).fill('#FAFBFF')
    else doc.rect(ML, y, W, rowH).fill('white')

    // borders
    doc.strokeColor('#D1D5DB').lineWidth(0.5)
    doc.rect(ML, y, col1, rowH).stroke()
    doc.rect(ML + col1, y, W - col1, rowH).stroke()

    doc.fillColor('#374151').fontSize(8.5).font('Helvetica-Bold')
    doc.text(label, ML + 5, y + 6, { width: col1 - 8 })

    doc.fillColor('#111827').font('Helvetica')
    doc.text(val(value), ML + col1 + 5, y + 6, { width: W - col1 - 8 })

    y += rowH
  }

  function twoCol(label1, val1, label2, val2) {
    const hw = W / 2
    doc.strokeColor('#D1D5DB').lineWidth(0.5)
    doc.rect(ML, y, hw, rowH).fill('white').stroke()
    doc.rect(ML + hw, y, hw, rowH).fill('white').stroke()

    doc.fillColor('#374151').fontSize(8.5).font('Helvetica-Bold')
    doc.text(label1, ML + 5, y + 6, { width: hw / 2 - 5 })
    doc.fillColor('#111827').font('Helvetica')
    doc.text(val(val1), ML + hw / 2, y + 6, { width: hw / 2 - 5 })

    doc.fillColor('#374151').font('Helvetica-Bold')
    doc.text(label2, ML + hw + 5, y + 6, { width: hw / 2 - 5 })
    doc.fillColor('#111827').font('Helvetica')
    doc.text(val(val2), ML + hw + hw / 2, y + 6, { width: hw / 2 - 5 })

    y += rowH
  }

  // ─── CHARGEMENT ──────────────────────────────────────────────
  section('CHARGEMENT')
  twoCol(
    'Date', new Date(fdr.date).toLocaleDateString('fr-FR'),
    'Lieu de chargement', fdr.lieuChargement
  )
  twoCol('Produit', fdr.produit, 'Destination', fdr.destination?.nom)
  twoCol(
    'Quantité (Tonnes)', fdr.quantiteTonnes != null ? `${fdr.quantiteTonnes} T` : '',
    'Nombre de sacs', fdr.nombreSacs != null ? fmtNum(fdr.nombreSacs) : ''
  )
  twoCol('N° BL', fdr.numeroBl, 'Distance', fdr.destination?.distanceDakar ? `${fdr.destination.distanceDakar} km` : '')
  twoCol('Véhicule', fdr.vehicule?.immatriculation, 'Type camion', fdr.vehicule?.typeCamion?.replace('_', ' '))
  row('Chauffeur', `${fdr.chauffeur?.nom || ''} ${fdr.chauffeur?.prenom || ''}`.trim())

  y += 6

  // ─── DÉCHARGEMENT ────────────────────────────────────────────
  section('DÉCHARGEMENT')
  twoCol(
    'Lieu de décharge', fdr.lieuDecharge,
    'Date de décharge', fdr.dateDecharge ? new Date(fdr.dateDecharge).toLocaleDateString('fr-FR') : ''
  )
  twoCol(
    'Quantité livrée (T)', fdr.quantiteLivree != null ? `${fdr.quantiteLivree} T` : '',
    'Sacs livrés', fdr.sacsLivres != null ? fmtNum(fdr.sacsLivres) : ''
  )
  row('Réserves / Observations', fdr.reserves)

  y += 6

  // ─── FRAIS DE MISSION ────────────────────────────────────────
  section('FRAIS DE MISSION')
  const carburantStr = fdr.carburantLitres != null
    ? `${fdr.carburantLitres} L  —  ${money(fdr.carburantFcfa)}`
    : ''
  row('Carburant', carburantStr)
  twoCol('Frais de route', money(fdr.fraisRoute), 'Autres frais', money(fdr.autresFrais))
  const total = (fdr.carburantFcfa || 0) + (fdr.fraisRoute || 0) + (fdr.autresFrais || 0)
  // Total row highlighted
  doc.rect(ML, y, W, rowH).fill('#EFF6FF')
  doc.strokeColor('#D1D5DB').lineWidth(0.5)
  doc.rect(ML, y, col1, rowH).stroke()
  doc.rect(ML + col1, y, W - col1, rowH).stroke()
  doc.fillColor('#0D1B3E').fontSize(8.5).font('Helvetica-Bold')
  doc.text('TOTAL FRAIS', ML + 5, y + 6, { width: col1 - 8 })
  doc.fillColor('#0D1B3E').font('Helvetica-Bold')
  doc.text(money(total), ML + col1 + 5, y + 6, { width: W - col1 - 8 })
  y += rowH

  y += 6

  // ─── SUIVI KILOMÉTRIQUE ──────────────────────────────────────
  section('SUIVI KILOMÉTRIQUE')
  const hw3 = W / 3
  doc.strokeColor('#D1D5DB').lineWidth(0.5)
  for (let i = 0; i < 3; i++) {
    doc.rect(ML + i * hw3, y, hw3, rowH).fill('white').stroke()
  }
  const kmLabels = ['Km départ', 'Km arrivée', 'Km parcourus']
  const kmVals   = [fdr.kmDepart, fdr.kmArrivee, fdr.kmParcourus]
  kmLabels.forEach((l, i) => {
    doc.fillColor('#374151').fontSize(8.5).font('Helvetica-Bold')
    doc.text(l, ML + i * hw3 + 5, y + 6, { width: hw3 / 2 - 5 })
    doc.fillColor('#111827').font('Helvetica')
    doc.text(kmVals[i] != null ? fmtNum(kmVals[i]) : '', ML + i * hw3 + hw3 / 2, y + 6, { width: hw3 / 2 - 5 })
  })
  y += rowH

  y += 10

  // ─── SIGNATURES ──────────────────────────────────────────────
  const sigW  = (W - 10) / 2
  const sigH  = 65

  // Visa Logistique
  doc.rect(ML, y, sigW, sigH).fill('#FAFAFA').stroke('#D1D5DB')
  doc.fillColor('#0D1B3E').fontSize(9).font('Helvetica-Bold')
  doc.text('VISA LOGISTIQUE', ML + 5, y + 6)
  if (fdr.visaLogistique) {
    doc.fillColor('#16a34a').fontSize(11).font('Helvetica-Bold')
    doc.text('✓ APPROUVÉ', ML + 5, y + 32, { width: sigW - 10, align: 'center' })
  }

  // Visa Direction
  doc.rect(ML + sigW + 10, y, sigW, sigH).fill('#FAFAFA').stroke('#D1D5DB')
  doc.fillColor('#0D1B3E').fontSize(9).font('Helvetica-Bold')
  doc.text('VISA DIRECTION', ML + sigW + 15, y + 6)
  if (fdr.visaDirection) {
    doc.fillColor('#16a34a').fontSize(11).font('Helvetica-Bold')
    doc.text('✓ APPROUVÉ', ML + sigW + 15, y + 32, { width: sigW - 10, align: 'center' })
  }

  // ─── PIED DE PAGE — ancré en bas de page ─────────────────────
  const footerH = 44
  const footerY = doc.page.height - footerH
  doc.rect(0, footerY, doc.page.width, footerH).fill('#0D1B3E')
  doc.fillColor('white').fontSize(8).font('Helvetica-Bold')
  doc.text(
    'Comptoir Commercial SALL et Frères (C.C.S.F)',
    0, footerY + 8, { width: doc.page.width, align: 'center' }
  )
  doc.font('Helvetica')
  doc.text(
    'Ouest Foire VDN 106 Lot NC 6, 5ième étage — Dakar, Sénégal',
    0, footerY + 19, { width: doc.page.width, align: 'center' }
  )
  doc.text(
    '+221 77 729 99 99  |  +221 77 546 77 05  |  abou.sall@cmosfs.com',
    0, footerY + 30, { width: doc.page.width, align: 'center' }
  )

  doc.end()
}

module.exports = { generateFeuilleDeRoutePDF }
