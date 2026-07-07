CREATE TABLE "api_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"consumer_name" text NOT NULL,
	"key_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"wallet_address" text NOT NULL,
	"discord_id" text,
	"farcaster_fid" integer,
	"display_name" text,
	"avatar_url" text,
	"bio" text,
	"ens_name" text,
	"ens_checked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"platform" text NOT NULL,
	"url_or_handle" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "social_links" ADD CONSTRAINT "social_links_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "api_keys_key_hash_unique" ON "api_keys" USING btree ("key_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_wallet_address_unique" ON "profiles" USING btree ("wallet_address");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_discord_id_unique" ON "profiles" USING btree ("discord_id") WHERE "profiles"."discord_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_farcaster_fid_unique" ON "profiles" USING btree ("farcaster_fid") WHERE "profiles"."farcaster_fid" is not null;--> statement-breakpoint
CREATE INDEX "social_links_profile_id_idx" ON "social_links" USING btree ("profile_id");