/*
  Warnings:

  - You are about to drop the column `pageId` on the `ApprovalConfig` table. All the data in the column will be lost.
  - You are about to drop the column `condition` on the `ApprovalLevel` table. All the data in the column will be lost.
  - Added the required column `moduleId` to the `ApprovalConfig` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ApprovalConfig" DROP CONSTRAINT "ApprovalConfig_pageId_fkey";

-- DropIndex
DROP INDEX "ApprovalConfig_branchId_pageId_key";

-- AlterTable
ALTER TABLE "ApprovalConfig" DROP COLUMN "pageId",
ADD COLUMN     "moduleId" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ruleLogicalOperator" TEXT NOT NULL DEFAULT 'AND';

-- AlterTable
ALTER TABLE "ApprovalLevel" DROP COLUMN "condition";

-- CreateTable
CREATE TABLE "ApprovalRuleModule" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ApprovalRuleModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalRuleField" (
    "id" SERIAL NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'number',
    "parentRelation" TEXT,
    "fieldPath" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ApprovalRuleField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalRuleOperator" (
    "id" SERIAL NOT NULL,
    "operator" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ApprovalRuleOperator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalConfigCondition" (
    "id" SERIAL NOT NULL,
    "approvalConfigId" INTEGER NOT NULL,
    "fieldId" INTEGER NOT NULL,
    "operatorId" INTEGER NOT NULL,
    "valueType" TEXT NOT NULL DEFAULT 'STATIC',
    "value" TEXT,
    "compareFieldId" INTEGER,

    CONSTRAINT "ApprovalConfigCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ApprovalRuleFieldToApprovalRuleOperator" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ApprovalRuleFieldToApprovalRuleOperator_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalRuleModule_name_key" ON "ApprovalRuleModule"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalRuleOperator_operator_key" ON "ApprovalRuleOperator"("operator");

-- CreateIndex
CREATE INDEX "_ApprovalRuleFieldToApprovalRuleOperator_B_index" ON "_ApprovalRuleFieldToApprovalRuleOperator"("B");

-- CreateIndex
CREATE INDEX "ApprovalLog_referenceId_referencePage_idx" ON "ApprovalLog"("referenceId", "referencePage");

-- AddForeignKey
ALTER TABLE "ApprovalRuleField" ADD CONSTRAINT "ApprovalRuleField_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "ApprovalRuleModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalConfigCondition" ADD CONSTRAINT "ApprovalConfigCondition_approvalConfigId_fkey" FOREIGN KEY ("approvalConfigId") REFERENCES "ApprovalConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalConfigCondition" ADD CONSTRAINT "ApprovalConfigCondition_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "ApprovalRuleField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalConfigCondition" ADD CONSTRAINT "ApprovalConfigCondition_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "ApprovalRuleOperator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalConfigCondition" ADD CONSTRAINT "ApprovalConfigCondition_compareFieldId_fkey" FOREIGN KEY ("compareFieldId") REFERENCES "ApprovalRuleField"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalConfig" ADD CONSTRAINT "ApprovalConfig_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "ApprovalRuleModule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApprovalRuleFieldToApprovalRuleOperator" ADD CONSTRAINT "_ApprovalRuleFieldToApprovalRuleOperator_A_fkey" FOREIGN KEY ("A") REFERENCES "ApprovalRuleField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApprovalRuleFieldToApprovalRuleOperator" ADD CONSTRAINT "_ApprovalRuleFieldToApprovalRuleOperator_B_fkey" FOREIGN KEY ("B") REFERENCES "ApprovalRuleOperator"("id") ON DELETE CASCADE ON UPDATE CASCADE;
