-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `role` ENUM('admin', 'logistique', 'chauffeur') NOT NULL DEFAULT 'logistique',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Chauffeur` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `telephone` VARCHAR(191) NOT NULL,
    `permisNumero` VARCHAR(191) NULL,
    `photoUrl` VARCHAR(191) NULL,
    `statut` ENUM('ACTIF', 'INACTIF') NOT NULL DEFAULT 'ACTIF',
    `vehiculeId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Chauffeur_telephone_key`(`telephone`),
    UNIQUE INDEX `Chauffeur_vehiculeId_key`(`vehiculeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vehicule` (
    `id` VARCHAR(191) NOT NULL,
    `immatriculation` VARCHAR(191) NOT NULL,
    `typeCamion` ENUM('HOWO_420', 'HOWO_380', 'MAN_TGS', 'IVECO', 'AUTRE') NOT NULL,
    `marque` VARCHAR(191) NULL,
    `modele` VARCHAR(191) NULL,
    `consommationRef` DOUBLE NOT NULL,
    `statut` ENUM('DISPONIBLE', 'EN_MISSION', 'MAINTENANCE') NOT NULL DEFAULT 'DISPONIBLE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Vehicule_immatriculation_key`(`immatriculation`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Destination` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `latitude` DOUBLE NOT NULL,
    `longitude` DOUBLE NOT NULL,
    `distanceDakar` DOUBLE NOT NULL,

    UNIQUE INDEX `Destination_nom_key`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FeuilleDeRoute` (
    `id` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `chauffeurId` VARCHAR(191) NOT NULL,
    `vehiculeId` VARCHAR(191) NOT NULL,
    `lieuChargement` VARCHAR(191) NOT NULL,
    `produit` VARCHAR(191) NOT NULL,
    `quantiteTonnes` DOUBLE NOT NULL,
    `nombreSacs` INTEGER NOT NULL,
    `destinationId` VARCHAR(191) NOT NULL,
    `numeroBl` VARCHAR(191) NULL,
    `dateDecharge` DATETIME(3) NULL,
    `lieuDecharge` VARCHAR(191) NULL,
    `quantiteLivree` DOUBLE NULL,
    `sacsLivres` INTEGER NULL,
    `reserves` TEXT NULL,
    `carburantLitres` DOUBLE NULL,
    `carburantFcfa` DOUBLE NULL,
    `fraisRoute` DOUBLE NULL,
    `autresFrais` DOUBLE NULL,
    `kmDepart` INTEGER NULL,
    `kmArrivee` INTEGER NULL,
    `kmParcourus` INTEGER NULL,
    `statut` ENUM('EN_ATTENTE', 'EN_ROUTE', 'LIVRE', 'ANNULE') NOT NULL DEFAULT 'EN_ATTENTE',
    `visaLogistique` BOOLEAN NOT NULL DEFAULT false,
    `visaDirection` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `FeuilleDeRoute_numero_key`(`numero`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DotationCarburant` (
    `id` VARCHAR(191) NOT NULL,
    `numeroBon` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `chauffeurId` VARCHAR(191) NOT NULL,
    `vehiculeId` VARCHAR(191) NOT NULL,
    `itineraire` VARCHAR(191) NOT NULL,
    `distanceKm` DOUBLE NOT NULL,
    `litresTheoriques` DOUBLE NOT NULL,
    `dotationBrute` DOUBLE NOT NULL,
    `margeFcfa` DOUBLE NOT NULL,
    `dotationTotale` DOUBLE NOT NULL,
    `litresReels` DOUBLE NULL,
    `montantReel` DOUBLE NULL,
    `ecartLitres` DOUBLE NULL,
    `ecartFcfa` DOUBLE NULL,
    `statut` ENUM('EN_ATTENTE', 'OK', 'DANS_MARGE', 'DEPASSEMENT') NOT NULL DEFAULT 'EN_ATTENTE',
    `moisPeriode` VARCHAR(191) NOT NULL,
    `responsable` VARCHAR(191) NULL,
    `validePar` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DotationCarburant_numeroBon_key`(`numeroBon`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Chauffeur` ADD CONSTRAINT `Chauffeur_vehiculeId_fkey` FOREIGN KEY (`vehiculeId`) REFERENCES `Vehicule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeuilleDeRoute` ADD CONSTRAINT `FeuilleDeRoute_chauffeurId_fkey` FOREIGN KEY (`chauffeurId`) REFERENCES `Chauffeur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeuilleDeRoute` ADD CONSTRAINT `FeuilleDeRoute_vehiculeId_fkey` FOREIGN KEY (`vehiculeId`) REFERENCES `Vehicule`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeuilleDeRoute` ADD CONSTRAINT `FeuilleDeRoute_destinationId_fkey` FOREIGN KEY (`destinationId`) REFERENCES `Destination`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DotationCarburant` ADD CONSTRAINT `DotationCarburant_chauffeurId_fkey` FOREIGN KEY (`chauffeurId`) REFERENCES `Chauffeur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DotationCarburant` ADD CONSTRAINT `DotationCarburant_vehiculeId_fkey` FOREIGN KEY (`vehiculeId`) REFERENCES `Vehicule`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
