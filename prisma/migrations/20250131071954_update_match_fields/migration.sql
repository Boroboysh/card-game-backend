-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "player1AP" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "player1Hand" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "player2AP" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "player2Hand" JSONB NOT NULL DEFAULT '[]';
