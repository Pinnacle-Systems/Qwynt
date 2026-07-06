-- AlterTable
ALTER TABLE `ledger` MODIFY `EntryType` ENUM('Purchase_Bill', 'Process_Bill', 'Sales', 'My_Payment', 'Customer_Payment', 'Credit_Note', 'Debit_Note', 'Opening_Balance', 'Printing_Job_Work') NULL,
    MODIFY `partyId` INTEGER NULL,
    MODIFY `amount` DOUBLE NULL,
    MODIFY `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` DATETIME(3) NULL;
