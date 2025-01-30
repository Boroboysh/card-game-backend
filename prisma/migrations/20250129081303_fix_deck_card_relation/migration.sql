/*
  Warnings:

  - You are about to drop the `_DeckCards` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `attack` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `defense` to the `Card` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_DeckCards" DROP CONSTRAINT "_DeckCards_A_fkey";

-- DropForeignKey
ALTER TABLE "_DeckCards" DROP CONSTRAINT "_DeckCards_B_fkey";

-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "attack" INTEGER NOT NULL,
ADD COLUMN     "defense" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_DeckCards";

-- CreateTable
CREATE TABLE "DeckOnCard" (
    "deckId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,

    CONSTRAINT "DeckOnCard_pkey" PRIMARY KEY ("deckId","cardId")
);

-- AddForeignKey
ALTER TABLE "DeckOnCard" ADD CONSTRAINT "DeckOnCard_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckOnCard" ADD CONSTRAINT "DeckOnCard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
