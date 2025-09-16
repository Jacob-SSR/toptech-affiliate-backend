-- AlterTable
ALTER TABLE `affiliate` ADD COLUMN `referredBy` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Affiliate` ADD CONSTRAINT `Affiliate_referredBy_fkey` FOREIGN KEY (`referredBy`) REFERENCES `Affiliate`(`code`) ON DELETE SET NULL ON UPDATE CASCADE;
