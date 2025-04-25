create type "public"."priority" as enum ('low', 'medium', 'high');

create sequence "public"."wishlist_items_id_seq";

create sequence "public"."wishlists_id_seq";

create table "public"."wishlist_items" (
    "id" integer not null default nextval('wishlist_items_id_seq'::regclass),
    "name" character varying(100) not null,
    "price" numeric not null,
    "priority" priority not null,
    "category" character varying(100),
    "link" character varying(255),
    "notes" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "wishlist_id" integer not null,
    "author_id" uuid not null
);


alter table "public"."wishlist_items" enable row level security;

create table "public"."wishlists" (
    "id" integer not null default nextval('wishlists_id_seq'::regclass),
    "uuid" uuid not null default gen_random_uuid(),
    "name" character varying(100) not null,
    "description" character varying(250),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "author_id" uuid not null
);


alter table "public"."wishlists" enable row level security;

alter sequence "public"."wishlist_items_id_seq" owned by "public"."wishlist_items"."id";

alter sequence "public"."wishlists_id_seq" owned by "public"."wishlists"."id";

CREATE UNIQUE INDEX wishlist_items_pkey ON public.wishlist_items USING btree (id);

CREATE INDEX wishlist_items_wishlist_id_idx ON public.wishlist_items USING btree (wishlist_id);

CREATE INDEX wishlists_author_id_idx ON public.wishlists USING btree (author_id);

CREATE UNIQUE INDEX wishlists_pkey ON public.wishlists USING btree (id);

alter table "public"."wishlist_items" add constraint "wishlist_items_pkey" PRIMARY KEY using index "wishlist_items_pkey";

alter table "public"."wishlists" add constraint "wishlists_pkey" PRIMARY KEY using index "wishlists_pkey";

alter table "public"."wishlist_items" add constraint "wishlist_items_author_id_fkey" FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."wishlist_items" validate constraint "wishlist_items_author_id_fkey";

alter table "public"."wishlist_items" add constraint "wishlist_items_wishlist_id_fkey" FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) not valid;

alter table "public"."wishlist_items" validate constraint "wishlist_items_wishlist_id_fkey";

alter table "public"."wishlists" add constraint "wishlists_author_id_fkey" FOREIGN KEY (author_id) REFERENCES auth.users(id) not valid;

alter table "public"."wishlists" validate constraint "wishlists_author_id_fkey";

grant delete on table "public"."wishlist_items" to "anon";

grant insert on table "public"."wishlist_items" to "anon";

grant references on table "public"."wishlist_items" to "anon";

grant select on table "public"."wishlist_items" to "anon";

grant trigger on table "public"."wishlist_items" to "anon";

grant truncate on table "public"."wishlist_items" to "anon";

grant update on table "public"."wishlist_items" to "anon";

grant delete on table "public"."wishlist_items" to "authenticated";

grant insert on table "public"."wishlist_items" to "authenticated";

grant references on table "public"."wishlist_items" to "authenticated";

grant select on table "public"."wishlist_items" to "authenticated";

grant trigger on table "public"."wishlist_items" to "authenticated";

grant truncate on table "public"."wishlist_items" to "authenticated";

grant update on table "public"."wishlist_items" to "authenticated";

grant delete on table "public"."wishlist_items" to "service_role";

grant insert on table "public"."wishlist_items" to "service_role";

grant references on table "public"."wishlist_items" to "service_role";

grant select on table "public"."wishlist_items" to "service_role";

grant trigger on table "public"."wishlist_items" to "service_role";

grant truncate on table "public"."wishlist_items" to "service_role";

grant update on table "public"."wishlist_items" to "service_role";

grant delete on table "public"."wishlists" to "anon";

grant insert on table "public"."wishlists" to "anon";

grant references on table "public"."wishlists" to "anon";

grant select on table "public"."wishlists" to "anon";

grant trigger on table "public"."wishlists" to "anon";

grant truncate on table "public"."wishlists" to "anon";

grant update on table "public"."wishlists" to "anon";

grant delete on table "public"."wishlists" to "authenticated";

grant insert on table "public"."wishlists" to "authenticated";

grant references on table "public"."wishlists" to "authenticated";

grant select on table "public"."wishlists" to "authenticated";

grant trigger on table "public"."wishlists" to "authenticated";

grant truncate on table "public"."wishlists" to "authenticated";

grant update on table "public"."wishlists" to "authenticated";

grant delete on table "public"."wishlists" to "service_role";

grant insert on table "public"."wishlists" to "service_role";

grant references on table "public"."wishlists" to "service_role";

grant select on table "public"."wishlists" to "service_role";

grant trigger on table "public"."wishlists" to "service_role";

grant truncate on table "public"."wishlists" to "service_role";

grant update on table "public"."wishlists" to "service_role";

create policy "Users can insert new wishlist items when authenticated"
on "public"."wishlist_items"
as permissive
for insert
to authenticated
with check (true);


create policy "Users can only delete their own wishlist items"
on "public"."wishlist_items"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = author_id));


create policy "Users can update their own wishlist items"
on "public"."wishlist_items"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = author_id));


create policy "Users can view their own wishlist items"
on "public"."wishlist_items"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = author_id));


create policy "Unauthenticated users can view wishlists"
on "public"."wishlists"
as permissive
for select
to public
using (true);


create policy "Users can insert new wishlists when authenticated"
on "public"."wishlists"
as permissive
for insert
to authenticated
with check (true);


create policy "Users can only delete their own wishlists"
on "public"."wishlists"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = author_id));


create policy "Users can update their own wishlists"
on "public"."wishlists"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = author_id));



