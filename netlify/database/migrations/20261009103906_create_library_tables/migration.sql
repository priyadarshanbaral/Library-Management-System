CREATE TABLE "admins" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "books" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL UNIQUE,
	"author" text NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"description" text NOT NULL,
	"page_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"dob" text NOT NULL,
	"mobile" text NOT NULL,
	"regd_no" integer GENERATED ALWAYS AS IDENTITY (sequence name "students_regd_no_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1001 CACHE 1),
	"password_hash" text NOT NULL,
	"issue" jsonb DEFAULT '[]' NOT NULL,
	"submit" jsonb DEFAULT '[]' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
