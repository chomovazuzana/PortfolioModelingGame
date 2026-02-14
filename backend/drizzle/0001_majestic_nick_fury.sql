ALTER TABLE "game_players" ADD COLUMN "hidden_from_leaderboard" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "round1_deadline" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "round2_deadline" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "round3_deadline" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "round4_deadline" timestamp with time zone;