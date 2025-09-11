/*
  Warnings:

  - Added the required column `password` to the `Affiliates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `affiliates` ADD COLUMN `password` VARCHAR(191) NOT NULL;
