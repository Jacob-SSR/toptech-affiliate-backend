/*
  Warnings:

  - You are about to drop the column `changed_at` on the `commissionstatushistory` table. All the data in the column will be lost.
  - You are about to drop the column `changed_by` on the `commissionstatushistory` table. All the data in the column will be lost.
  - You are about to drop the column `commission_id` on the `commissionstatushistory` table. All the data in the column will be lost.
  - You are about to drop the column `new_status` on the `commissionstatushistory` table. All the data in the column will be lost.
  - You are about to drop the column `old_status` on the `commissionstatushistory` table. All the data in the column will be lost.
  - You are about to drop the `affiliates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `commissionrules` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `commissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `leads` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `referralclicks` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `changedBy` to the `CommissionStatusHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commissionId` to the `CommissionStatusHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `newStatus` to the `CommissionStatusHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `oldStatus` to the `CommissionStatusHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `commissions` DROP FOREIGN KEY `Commissions_affiliate_id_fkey`;

-- DropForeignKey
ALTER TABLE `commissions` DROP FOREIGN KEY `Commissions_order_id_fkey`;

-- DropForeignKey
ALTER TABLE `commissions` DROP FOREIGN KEY `Commissions_payment_id_fkey`;

-- DropForeignKey
ALTER TABLE `commissions` DROP FOREIGN KEY `Commissions_rule_id_fkey`;

-- DropForeignKey
ALTER TABLE `commissionstatushistory` DROP FOREIGN KEY `CommissionStatusHistory_commission_id_fkey`;

-- DropForeignKey
ALTER TABLE `leads` DROP FOREIGN KEY `Leads_affiliate_id_fkey`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `Orders_lead_id_fkey`;

-- DropForeignKey
ALTER TABLE `payments` DROP FOREIGN KEY `Payments_affiliate_id_fkey`;

-- DropForeignKey
ALTER TABLE `referralclicks` DROP FOREIGN KEY `ReferralClicks_affiliate_id_fkey`;

-- DropIndex
DROP INDEX `CommissionStatusHistory_commission_id_fkey` ON `commissionstatushistory`;

-- AlterTable
ALTER TABLE `commissionstatushistory` DROP COLUMN `changed_at`,
    DROP COLUMN `changed_by`,
    DROP COLUMN `commission_id`,
    DROP COLUMN `new_status`,
    DROP COLUMN `old_status`,
    ADD COLUMN `changedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `changedBy` VARCHAR(191) NOT NULL,
    ADD COLUMN `commissionId` INTEGER NOT NULL,
    ADD COLUMN `newStatus` ENUM('PENDING', 'PAID') NOT NULL,
    ADD COLUMN `oldStatus` ENUM('PENDING', 'PAID') NOT NULL;

-- DropTable
DROP TABLE `affiliates`;

-- DropTable
DROP TABLE `commissionrules`;

-- DropTable
DROP TABLE `commissions`;

-- DropTable
DROP TABLE `leads`;

-- DropTable
DROP TABLE `orders`;

-- DropTable
DROP TABLE `payments`;

-- DropTable
DROP TABLE `referralclicks`;

-- CreateTable
CREATE TABLE `Affiliate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `link` VARCHAR(191) NULL,
    `emailConfirmed` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `paymentDetails` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Affiliate_code_key`(`code`),
    UNIQUE INDEX `Affiliate_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReferralClick` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `affiliateId` INTEGER NOT NULL,
    `campaignCode` VARCHAR(191) NOT NULL,
    `ipAddress` VARCHAR(191) NOT NULL,
    `userAgent` VARCHAR(191) NOT NULL,
    `clickedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lead` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `affiliateId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `status` ENUM('NEW', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'NEW',
    `sourceCampaign` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Lead_affiliateId_email_key`(`affiliateId`, `email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `leadId` INTEGER NOT NULL,
    `totalAmount` DECIMAL(10, 2) NOT NULL,
    `downPayment` DECIMAL(10, 2) NOT NULL,
    `installments` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Commission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `affiliateId` INTEGER NOT NULL,
    `ruleId` INTEGER NOT NULL,
    `paymentId` INTEGER NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('PENDING', 'PAID') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `affiliateId` INTEGER NOT NULL,
    `totalAmount` DECIMAL(10, 2) NOT NULL,
    `paidAt` DATETIME(3) NULL,
    `referenceNo` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'PAID', 'FAILED') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CommissionRule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('FLAT', 'PERCENTAGE', 'STAGED') NOT NULL,
    `parameters` JSON NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ReferralClick` ADD CONSTRAINT `ReferralClick_affiliateId_fkey` FOREIGN KEY (`affiliateId`) REFERENCES `Affiliate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lead` ADD CONSTRAINT `Lead_affiliateId_fkey` FOREIGN KEY (`affiliateId`) REFERENCES `Affiliate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `Lead`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commission` ADD CONSTRAINT `Commission_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commission` ADD CONSTRAINT `Commission_affiliateId_fkey` FOREIGN KEY (`affiliateId`) REFERENCES `Affiliate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commission` ADD CONSTRAINT `Commission_ruleId_fkey` FOREIGN KEY (`ruleId`) REFERENCES `CommissionRule`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commission` ADD CONSTRAINT `Commission_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommissionStatusHistory` ADD CONSTRAINT `CommissionStatusHistory_commissionId_fkey` FOREIGN KEY (`commissionId`) REFERENCES `Commission`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_affiliateId_fkey` FOREIGN KEY (`affiliateId`) REFERENCES `Affiliate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
