-- CreateTable
CREATE TABLE `Affiliates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `payment_details` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Affiliates_code_key`(`code`),
    UNIQUE INDEX `Affiliates_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReferralClicks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `affiliate_id` INTEGER NOT NULL,
    `campaign_code` VARCHAR(191) NOT NULL,
    `ip_address` VARCHAR(191) NOT NULL,
    `user_agent` VARCHAR(191) NOT NULL,
    `clicked_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Leads` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `affiliate_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `status` ENUM('new', 'approved', 'rejected') NOT NULL DEFAULT 'new',
    `source_campaign` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Leads_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Orders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lead_id` INTEGER NOT NULL,
    `total_amount` INTEGER NOT NULL,
    `down_payment` DECIMAL(65, 30) NOT NULL,
    `installments` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Commissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `affiliate_id` INTEGER NOT NULL,
    `rule_id` INTEGER NOT NULL,
    `payment_id` INTEGER NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `status` ENUM('pending', 'paid') NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CommissionStatusHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `commission_id` INTEGER NOT NULL,
    `old_status` ENUM('pending', 'paid') NOT NULL,
    `new_status` ENUM('pending', 'paid') NOT NULL,
    `changed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `changed_by` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `affiliate_id` INTEGER NOT NULL,
    `total_amount` DECIMAL(65, 30) NOT NULL,
    `paid_at` DATETIME(3) NOT NULL,
    `reference_no` VARCHAR(191) NOT NULL,
    `status` ENUM('paid', 'failed', 'pending') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CommissionRules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('flat', 'percentage', 'staged') NOT NULL,
    `parameters` JSON NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ReferralClicks` ADD CONSTRAINT `ReferralClicks_affiliate_id_fkey` FOREIGN KEY (`affiliate_id`) REFERENCES `Affiliates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Leads` ADD CONSTRAINT `Leads_affiliate_id_fkey` FOREIGN KEY (`affiliate_id`) REFERENCES `Affiliates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Orders` ADD CONSTRAINT `Orders_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `Leads`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commissions` ADD CONSTRAINT `Commissions_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `Orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commissions` ADD CONSTRAINT `Commissions_affiliate_id_fkey` FOREIGN KEY (`affiliate_id`) REFERENCES `Affiliates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commissions` ADD CONSTRAINT `Commissions_rule_id_fkey` FOREIGN KEY (`rule_id`) REFERENCES `CommissionRules`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commissions` ADD CONSTRAINT `Commissions_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `Payments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommissionStatusHistory` ADD CONSTRAINT `CommissionStatusHistory_commission_id_fkey` FOREIGN KEY (`commission_id`) REFERENCES `Commissions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payments` ADD CONSTRAINT `Payments_affiliate_id_fkey` FOREIGN KEY (`affiliate_id`) REFERENCES `Affiliates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
