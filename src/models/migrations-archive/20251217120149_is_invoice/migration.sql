-- AlterTable
ALTER TABLE `deliverychallanitems` ADD COLUMN `isInvoice` BOOLEAN NULL DEFAULT false,
    MODIFY `active` BOOLEAN NULL DEFAULT false;
