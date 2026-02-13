CREATE TYPE "public"."asset_class" AS ENUM('cash', 'bonds', 'equities', 'commodities', 'reits');--> statement-breakpoint
CREATE TYPE "public"."game_status" AS ENUM('open', 'closed', 'completed');--> statement-breakpoint
CREATE TYPE "public"."player_game_status" AS ENUM('playing', 'completed');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('player', 'admin');--> statement-breakpoint
CREATE TABLE "allocations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"year" integer NOT NULL,
	"cash_pct" integer NOT NULL,
	"bonds_pct" integer NOT NULL,
	"equities_pct" integer NOT NULL,
	"commodities_pct" integer NOT NULL,
	"reits_pct" integer NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "allocations_sum_check" CHECK ("allocations"."cash_pct" + "allocations"."bonds_pct" + "allocations"."equities_pct" + "allocations"."commodities_pct" + "allocations"."reits_pct" = 100),
	CONSTRAINT "allocations_cash_range" CHECK ("allocations"."cash_pct" BETWEEN 0 AND 100),
	CONSTRAINT "allocations_bonds_range" CHECK ("allocations"."bonds_pct" BETWEEN 0 AND 100),
	CONSTRAINT "allocations_equities_range" CHECK ("allocations"."equities_pct" BETWEEN 0 AND 100),
	CONSTRAINT "allocations_commodities_range" CHECK ("allocations"."commodities_pct" BETWEEN 0 AND 100),
	CONSTRAINT "allocations_reits_range" CHECK ("allocations"."reits_pct" BETWEEN 0 AND 100)
);
--> statement-breakpoint
CREATE TABLE "asset_returns" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	"asset_class" "asset_class" NOT NULL,
	"return_pct" numeric(8, 4) NOT NULL,
	"scenario_title" text NOT NULL,
	"scenario_description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fund_benchmarks" (
	"id" serial PRIMARY KEY NOT NULL,
	"fund_id" integer NOT NULL,
	"fund_name" text NOT NULL,
	"fund_type" text NOT NULL,
	"year" integer NOT NULL,
	"cash_pct" numeric(6, 2) NOT NULL,
	"fixed_income_pct" numeric(6, 2) NOT NULL,
	"equity_pct" numeric(6, 2) NOT NULL,
	"return_pct" numeric(8, 4) NOT NULL,
	"sharpe_ratio" numeric(6, 4) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_players" (
	"game_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"current_year" integer DEFAULT 2021 NOT NULL,
	"status" "player_game_status" DEFAULT 'playing' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"game_code" text NOT NULL,
	"status" "game_status" DEFAULT 'open' NOT NULL,
	"initial_capital" numeric(12, 2) DEFAULT '100000.00' NOT NULL,
	"deadline" timestamp with time zone,
	"max_players" integer,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "games_game_code_unique" UNIQUE("game_code")
);
--> statement-breakpoint
CREATE TABLE "portfolio_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"year" integer NOT NULL,
	"value_start" numeric(14, 2) NOT NULL,
	"value_end" numeric(14, 2) NOT NULL,
	"return_pct" numeric(8, 4) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"display_name" text NOT NULL,
	"role" "user_role" DEFAULT 'player' NOT NULL,
	"organizational_unit" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "allocations" ADD CONSTRAINT "allocations_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "allocations" ADD CONSTRAINT "allocations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_players" ADD CONSTRAINT "game_players_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_players" ADD CONSTRAINT "game_players_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_snapshots" ADD CONSTRAINT "portfolio_snapshots_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_snapshots" ADD CONSTRAINT "portfolio_snapshots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "allocations_unique" ON "allocations" USING btree ("game_id","user_id","year");--> statement-breakpoint
CREATE INDEX "allocations_game_user_idx" ON "allocations" USING btree ("game_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "asset_returns_unique" ON "asset_returns" USING btree ("year","asset_class");--> statement-breakpoint
CREATE UNIQUE INDEX "fund_benchmarks_unique" ON "fund_benchmarks" USING btree ("fund_id","year");--> statement-breakpoint
CREATE INDEX "fund_benchmarks_fund_idx" ON "fund_benchmarks" USING btree ("fund_id");--> statement-breakpoint
CREATE UNIQUE INDEX "game_players_pk" ON "game_players" USING btree ("game_id","user_id");--> statement-breakpoint
CREATE INDEX "game_players_game_idx" ON "game_players" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "game_players_user_idx" ON "game_players" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "games_status_idx" ON "games" USING btree ("status");--> statement-breakpoint
CREATE INDEX "games_created_by_idx" ON "games" USING btree ("created_by");--> statement-breakpoint
CREATE UNIQUE INDEX "snapshots_unique" ON "portfolio_snapshots" USING btree ("game_id","user_id","year");--> statement-breakpoint
CREATE INDEX "snapshots_game_user_idx" ON "portfolio_snapshots" USING btree ("game_id","user_id");