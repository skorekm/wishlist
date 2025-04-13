

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."priority" AS ENUM (
    'low',
    'medium',
    'high'
);


ALTER TYPE "public"."priority" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."wishlist_items" (
    "id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "price" numeric NOT NULL,
    "priority" "public"."priority" NOT NULL,
    "category" character varying(100),
    "link" character varying(255),
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "wishlist_id" integer NOT NULL,
    "author_id" "uuid" NOT NULL
);


ALTER TABLE "public"."wishlist_items" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."wishlist_items_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."wishlist_items_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."wishlist_items_id_seq" OWNED BY "public"."wishlist_items"."id";



CREATE TABLE IF NOT EXISTS "public"."wishlists" (
    "id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "description" character varying(250),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "author_id" "uuid" NOT NULL
);


ALTER TABLE "public"."wishlists" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."wishlists_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."wishlists_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."wishlists_id_seq" OWNED BY "public"."wishlists"."id";



ALTER TABLE ONLY "public"."wishlist_items" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."wishlist_items_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."wishlists" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."wishlists_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."wishlist_items"
    ADD CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wishlists"
    ADD CONSTRAINT "wishlists_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wishlist_items"
    ADD CONSTRAINT "wishlist_items_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."wishlist_items"
    ADD CONSTRAINT "wishlist_items_wishlist_id_fkey" FOREIGN KEY ("wishlist_id") REFERENCES "public"."wishlists"("id");



ALTER TABLE ONLY "public"."wishlists"
    ADD CONSTRAINT "wishlists_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "auth"."users"("id");



CREATE POLICY "Users can insert new wishlists when authenticated" ON "public"."wishlists" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Users can only delete their own wishlists" ON "public"."wishlists" FOR DELETE USING (("auth"."uid"() = "author_id"));



CREATE POLICY "Users can view their own wishlists" ON "public"."wishlists" FOR SELECT USING (("auth"."uid"() = "author_id"));



ALTER TABLE "public"."wishlists" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";









































































































































































































GRANT ALL ON TABLE "public"."wishlist_items" TO "anon";
GRANT ALL ON TABLE "public"."wishlist_items" TO "authenticated";
GRANT ALL ON TABLE "public"."wishlist_items" TO "service_role";



GRANT ALL ON SEQUENCE "public"."wishlist_items_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."wishlist_items_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."wishlist_items_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."wishlists" TO "anon";
GRANT ALL ON TABLE "public"."wishlists" TO "authenticated";
GRANT ALL ON TABLE "public"."wishlists" TO "service_role";



GRANT ALL ON SEQUENCE "public"."wishlists_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."wishlists_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."wishlists_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;

--
-- Dumped schema changes for auth and storage
--

