create extension if not exists "pg_cron" with schema "pg_catalog";

create type "public"."priority" as enum ('low', 'medium', 'high');

create type "public"."reservation_status" as enum ('available', 'reserved', 'purchased', 'cancelled');

create sequence "public"."currencies_id_seq";

create sequence "public"."permissions_id_seq";

create sequence "public"."reservations_id_seq";

create sequence "public"."share_links_id_seq";

create sequence "public"."wishlist_items_id_seq";

create sequence "public"."wishlist_permissions_id_seq";

create sequence "public"."wishlists_id_seq";


  create table "public"."currencies" (
    "id" integer not null default nextval('public.currencies_id_seq'::regclass),
    "entity" character varying(100) not null,
    "currency" character varying(100) not null,
    "code" character varying(10) not null,
    "numeric" character varying(10),
    "minor_unit" character varying(10),
    "withdrawal_date" character varying(50)
      );



  create table "public"."permissions" (
    "id" integer not null default nextval('public.permissions_id_seq'::regclass),
    "name" character varying(100) not null,
    "description" character varying(100) not null
      );


alter table "public"."permissions" enable row level security;


  create table "public"."reservations" (
    "id" integer not null default nextval('public.reservations_id_seq'::regclass),
    "wishlist_item_id" integer not null,
    "user_id" uuid,
    "reserver_name" character varying(255),
    "reserver_email" character varying(255),
    "reservation_code" character varying(255) not null,
    "created_at" timestamp with time zone not null default now(),
    "expires_at" timestamp with time zone not null,
    "status" public.reservation_status not null
      );


alter table "public"."reservations" enable row level security;


  create table "public"."share_links" (
    "id" integer not null default nextval('public.share_links_id_seq'::regclass),
    "wishlist_id" integer not null,
    "share_token" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "created_by" uuid not null,
    "revoked_at" timestamp with time zone,
    "last_accessed_at" timestamp with time zone
      );


alter table "public"."share_links" enable row level security;


  create table "public"."wishlist_items" (
    "id" integer not null default nextval('public.wishlist_items_id_seq'::regclass),
    "name" character varying(100) not null,
    "price" numeric not null,
    "currency" integer not null,
    "priority" public.priority not null,
    "category" character varying(100),
    "link" character varying(255),
    "notes" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "wishlist_id" integer not null,
    "author_id" uuid not null
      );


alter table "public"."wishlist_items" enable row level security;


  create table "public"."wishlist_permissions" (
    "id" integer not null default nextval('public.wishlist_permissions_id_seq'::regclass),
    "permission_id" integer not null,
    "wishlist_id" integer not null,
    "user_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "created_by" uuid not null
      );


alter table "public"."wishlist_permissions" enable row level security;


  create table "public"."wishlists" (
    "id" integer not null default nextval('public.wishlists_id_seq'::regclass),
    "uuid" uuid not null default gen_random_uuid(),
    "name" character varying(100) not null,
    "description" character varying(250),
    "event_date" date,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "author_id" uuid not null
      );


alter table "public"."wishlists" enable row level security;

alter sequence "public"."currencies_id_seq" owned by "public"."currencies"."id";

alter sequence "public"."permissions_id_seq" owned by "public"."permissions"."id";

alter sequence "public"."reservations_id_seq" owned by "public"."reservations"."id";

alter sequence "public"."share_links_id_seq" owned by "public"."share_links"."id";

alter sequence "public"."wishlist_items_id_seq" owned by "public"."wishlist_items"."id";

alter sequence "public"."wishlist_permissions_id_seq" owned by "public"."wishlist_permissions"."id";

alter sequence "public"."wishlists_id_seq" owned by "public"."wishlists"."id";

CREATE INDEX currencies_code_idx ON public.currencies USING btree (code);

CREATE UNIQUE INDEX currencies_pkey ON public.currencies USING btree (id);

CREATE INDEX permissions_description_idx ON public.permissions USING btree (description);

CREATE INDEX permissions_name_idx ON public.permissions USING btree (name);

CREATE UNIQUE INDEX permissions_pkey ON public.permissions USING btree (id);

CREATE UNIQUE INDEX reservations_pkey ON public.reservations USING btree (id);

CREATE INDEX reservations_reservation_code_idx ON public.reservations USING btree (reservation_code);

CREATE UNIQUE INDEX reservations_reservation_code_key ON public.reservations USING btree (reservation_code);

CREATE UNIQUE INDEX share_links_pkey ON public.share_links USING btree (id);

CREATE INDEX share_links_revoked_at_idx ON public.share_links USING btree (revoked_at) WHERE (revoked_at IS NULL);

CREATE INDEX share_links_share_token_idx ON public.share_links USING btree (share_token);

CREATE UNIQUE INDEX share_links_share_token_key ON public.share_links USING btree (share_token);

CREATE INDEX share_links_wishlist_id_idx ON public.share_links USING btree (wishlist_id);

CREATE UNIQUE INDEX unique_wishlist_user_permission ON public.wishlist_permissions USING btree (wishlist_id, user_id, permission_id);

CREATE UNIQUE INDEX wishlist_items_pkey ON public.wishlist_items USING btree (id);

CREATE INDEX wishlist_items_wishlist_id_idx ON public.wishlist_items USING btree (wishlist_id);

CREATE INDEX wishlist_permissions_permission_id_idx ON public.wishlist_permissions USING btree (permission_id);

CREATE UNIQUE INDEX wishlist_permissions_pkey ON public.wishlist_permissions USING btree (id);

CREATE INDEX wishlist_permissions_user_id_idx ON public.wishlist_permissions USING btree (user_id);

CREATE INDEX wishlist_permissions_wishlist_id_idx ON public.wishlist_permissions USING btree (wishlist_id);

CREATE INDEX wishlists_author_id_idx ON public.wishlists USING btree (author_id);

CREATE UNIQUE INDEX wishlists_pkey ON public.wishlists USING btree (id);

CREATE UNIQUE INDEX wishlists_uuid_key ON public.wishlists USING btree (uuid);

alter table "public"."currencies" add constraint "currencies_pkey" PRIMARY KEY using index "currencies_pkey";

alter table "public"."permissions" add constraint "permissions_pkey" PRIMARY KEY using index "permissions_pkey";

alter table "public"."reservations" add constraint "reservations_pkey" PRIMARY KEY using index "reservations_pkey";

alter table "public"."share_links" add constraint "share_links_pkey" PRIMARY KEY using index "share_links_pkey";

alter table "public"."wishlist_items" add constraint "wishlist_items_pkey" PRIMARY KEY using index "wishlist_items_pkey";

alter table "public"."wishlist_permissions" add constraint "wishlist_permissions_pkey" PRIMARY KEY using index "wishlist_permissions_pkey";

alter table "public"."wishlists" add constraint "wishlists_pkey" PRIMARY KEY using index "wishlists_pkey";

alter table "public"."reservations" add constraint "reservations_reservation_code_key" UNIQUE using index "reservations_reservation_code_key";

alter table "public"."reservations" add constraint "reservations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."reservations" validate constraint "reservations_user_id_fkey";

alter table "public"."reservations" add constraint "reservations_wishlist_item_id_fkey" FOREIGN KEY (wishlist_item_id) REFERENCES public.wishlist_items(id) ON DELETE CASCADE not valid;

alter table "public"."reservations" validate constraint "reservations_wishlist_item_id_fkey";

alter table "public"."share_links" add constraint "share_links_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."share_links" validate constraint "share_links_created_by_fkey";

alter table "public"."share_links" add constraint "share_links_share_token_key" UNIQUE using index "share_links_share_token_key";

alter table "public"."share_links" add constraint "share_links_wishlist_id_fkey" FOREIGN KEY (wishlist_id) REFERENCES public.wishlists(id) ON DELETE CASCADE not valid;

alter table "public"."share_links" validate constraint "share_links_wishlist_id_fkey";

alter table "public"."wishlist_items" add constraint "wishlist_items_author_id_fkey" FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."wishlist_items" validate constraint "wishlist_items_author_id_fkey";

alter table "public"."wishlist_items" add constraint "wishlist_items_currency_fkey" FOREIGN KEY (currency) REFERENCES public.currencies(id) not valid;

alter table "public"."wishlist_items" validate constraint "wishlist_items_currency_fkey";

alter table "public"."wishlist_items" add constraint "wishlist_items_wishlist_id_fkey" FOREIGN KEY (wishlist_id) REFERENCES public.wishlists(id) ON DELETE CASCADE not valid;

alter table "public"."wishlist_items" validate constraint "wishlist_items_wishlist_id_fkey";

alter table "public"."wishlist_permissions" add constraint "unique_wishlist_user_permission" UNIQUE using index "unique_wishlist_user_permission";

alter table "public"."wishlist_permissions" add constraint "wishlist_permissions_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."wishlist_permissions" validate constraint "wishlist_permissions_created_by_fkey";

alter table "public"."wishlist_permissions" add constraint "wishlist_permissions_permission_id_fkey" FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE not valid;

alter table "public"."wishlist_permissions" validate constraint "wishlist_permissions_permission_id_fkey";

alter table "public"."wishlist_permissions" add constraint "wishlist_permissions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."wishlist_permissions" validate constraint "wishlist_permissions_user_id_fkey";

alter table "public"."wishlist_permissions" add constraint "wishlist_permissions_wishlist_id_fkey" FOREIGN KEY (wishlist_id) REFERENCES public.wishlists(id) ON DELETE CASCADE not valid;

alter table "public"."wishlist_permissions" validate constraint "wishlist_permissions_wishlist_id_fkey";

alter table "public"."wishlists" add constraint "wishlists_author_id_fkey" FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."wishlists" validate constraint "wishlists_author_id_fkey";

alter table "public"."wishlists" add constraint "wishlists_uuid_key" UNIQUE using index "wishlists_uuid_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.assign_author_permissions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  -- Assign all author/owner permissions for the wishlist
  insert into public.wishlist_permissions (wishlist_id, user_id, permission_id, created_by)
  select 
    new.id,
    new.author_id,
    p.id,
    new.author_id
  from public.permissions p
  where p.name in (
    'wishlist:view',
    'wishlist:edit',
    'wishlist:delete',
    'wishlist:share',
    'wishlist_item:create',
    'wishlist_item:edit',
    'wishlist_item:delete'
  );
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.cancel_expired_reservations()
 RETURNS TABLE(cancelled_count integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  affected_rows integer;
BEGIN
  UPDATE public.reservations
  SET status = 'cancelled'
  WHERE status = 'reserved'
    AND expires_at < now();
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  RETURN QUERY SELECT affected_rows;
END;
$function$
;

grant delete on table "public"."currencies" to "anon";

grant insert on table "public"."currencies" to "anon";

grant references on table "public"."currencies" to "anon";

grant select on table "public"."currencies" to "anon";

grant trigger on table "public"."currencies" to "anon";

grant truncate on table "public"."currencies" to "anon";

grant update on table "public"."currencies" to "anon";

grant delete on table "public"."currencies" to "authenticated";

grant insert on table "public"."currencies" to "authenticated";

grant references on table "public"."currencies" to "authenticated";

grant select on table "public"."currencies" to "authenticated";

grant trigger on table "public"."currencies" to "authenticated";

grant truncate on table "public"."currencies" to "authenticated";

grant update on table "public"."currencies" to "authenticated";

grant delete on table "public"."currencies" to "service_role";

grant insert on table "public"."currencies" to "service_role";

grant references on table "public"."currencies" to "service_role";

grant select on table "public"."currencies" to "service_role";

grant trigger on table "public"."currencies" to "service_role";

grant truncate on table "public"."currencies" to "service_role";

grant update on table "public"."currencies" to "service_role";

grant delete on table "public"."permissions" to "anon";

grant insert on table "public"."permissions" to "anon";

grant references on table "public"."permissions" to "anon";

grant select on table "public"."permissions" to "anon";

grant trigger on table "public"."permissions" to "anon";

grant truncate on table "public"."permissions" to "anon";

grant update on table "public"."permissions" to "anon";

grant delete on table "public"."permissions" to "authenticated";

grant insert on table "public"."permissions" to "authenticated";

grant references on table "public"."permissions" to "authenticated";

grant select on table "public"."permissions" to "authenticated";

grant trigger on table "public"."permissions" to "authenticated";

grant truncate on table "public"."permissions" to "authenticated";

grant update on table "public"."permissions" to "authenticated";

grant delete on table "public"."permissions" to "service_role";

grant insert on table "public"."permissions" to "service_role";

grant references on table "public"."permissions" to "service_role";

grant select on table "public"."permissions" to "service_role";

grant trigger on table "public"."permissions" to "service_role";

grant truncate on table "public"."permissions" to "service_role";

grant update on table "public"."permissions" to "service_role";

grant delete on table "public"."reservations" to "anon";

grant insert on table "public"."reservations" to "anon";

grant references on table "public"."reservations" to "anon";

grant select on table "public"."reservations" to "anon";

grant trigger on table "public"."reservations" to "anon";

grant truncate on table "public"."reservations" to "anon";

grant update on table "public"."reservations" to "anon";

grant delete on table "public"."reservations" to "authenticated";

grant insert on table "public"."reservations" to "authenticated";

grant references on table "public"."reservations" to "authenticated";

grant select on table "public"."reservations" to "authenticated";

grant trigger on table "public"."reservations" to "authenticated";

grant truncate on table "public"."reservations" to "authenticated";

grant update on table "public"."reservations" to "authenticated";

grant delete on table "public"."reservations" to "service_role";

grant insert on table "public"."reservations" to "service_role";

grant references on table "public"."reservations" to "service_role";

grant select on table "public"."reservations" to "service_role";

grant trigger on table "public"."reservations" to "service_role";

grant truncate on table "public"."reservations" to "service_role";

grant update on table "public"."reservations" to "service_role";

grant delete on table "public"."share_links" to "anon";

grant insert on table "public"."share_links" to "anon";

grant references on table "public"."share_links" to "anon";

grant select on table "public"."share_links" to "anon";

grant trigger on table "public"."share_links" to "anon";

grant truncate on table "public"."share_links" to "anon";

grant update on table "public"."share_links" to "anon";

grant delete on table "public"."share_links" to "authenticated";

grant insert on table "public"."share_links" to "authenticated";

grant references on table "public"."share_links" to "authenticated";

grant select on table "public"."share_links" to "authenticated";

grant trigger on table "public"."share_links" to "authenticated";

grant truncate on table "public"."share_links" to "authenticated";

grant update on table "public"."share_links" to "authenticated";

grant delete on table "public"."share_links" to "service_role";

grant insert on table "public"."share_links" to "service_role";

grant references on table "public"."share_links" to "service_role";

grant select on table "public"."share_links" to "service_role";

grant trigger on table "public"."share_links" to "service_role";

grant truncate on table "public"."share_links" to "service_role";

grant update on table "public"."share_links" to "service_role";

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

grant delete on table "public"."wishlist_permissions" to "anon";

grant insert on table "public"."wishlist_permissions" to "anon";

grant references on table "public"."wishlist_permissions" to "anon";

grant select on table "public"."wishlist_permissions" to "anon";

grant trigger on table "public"."wishlist_permissions" to "anon";

grant truncate on table "public"."wishlist_permissions" to "anon";

grant update on table "public"."wishlist_permissions" to "anon";

grant delete on table "public"."wishlist_permissions" to "authenticated";

grant insert on table "public"."wishlist_permissions" to "authenticated";

grant references on table "public"."wishlist_permissions" to "authenticated";

grant select on table "public"."wishlist_permissions" to "authenticated";

grant trigger on table "public"."wishlist_permissions" to "authenticated";

grant truncate on table "public"."wishlist_permissions" to "authenticated";

grant update on table "public"."wishlist_permissions" to "authenticated";

grant delete on table "public"."wishlist_permissions" to "service_role";

grant insert on table "public"."wishlist_permissions" to "service_role";

grant references on table "public"."wishlist_permissions" to "service_role";

grant select on table "public"."wishlist_permissions" to "service_role";

grant trigger on table "public"."wishlist_permissions" to "service_role";

grant truncate on table "public"."wishlist_permissions" to "service_role";

grant update on table "public"."wishlist_permissions" to "service_role";

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


  create policy "Users can only read the currencies"
  on "public"."currencies"
  as permissive
  for select
  to public
using (true);



  create policy "Authenticated users can view permissions"
  on "public"."permissions"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Anyone can create a reservation"
  on "public"."reservations"
  as permissive
  for insert
  to anon, authenticated
with check ((expires_at > now()));



  create policy "Anyone can update their own reservation with valid code"
  on "public"."reservations"
  as permissive
  for update
  to anon, authenticated
using (true)
with check (true);



  create policy "Anyone can view reservations for items in shared wishlists"
  on "public"."reservations"
  as permissive
  for select
  to anon, authenticated
using ((EXISTS ( SELECT 1
   FROM ((public.wishlist_items wi
     JOIN public.wishlists w ON ((w.id = wi.wishlist_id)))
     JOIN public.share_links sl ON ((sl.wishlist_id = w.id)))
  WHERE ((wi.id = reservations.wishlist_item_id) AND (sl.revoked_at IS NULL)))));



  create policy "Reservation owners and wishlist owners can view reservations"
  on "public"."reservations"
  as permissive
  for select
  to authenticated
using (((( SELECT auth.uid() AS uid) = user_id) OR (EXISTS ( SELECT 1
   FROM (public.wishlist_items wi
     JOIN public.wishlists w ON ((w.id = wi.wishlist_id)))
  WHERE ((wi.id = reservations.wishlist_item_id) AND (w.author_id = auth.uid()))))));



  create policy "Anyone can verify share links by token"
  on "public"."share_links"
  as permissive
  for select
  to anon
using ((revoked_at IS NULL));



  create policy "Authenticated users can view share links"
  on "public"."share_links"
  as permissive
  for select
  to authenticated
using (((created_by = ( SELECT auth.uid() AS uid)) OR (revoked_at IS NULL)));



  create policy "Users can create share links for their wishlists"
  on "public"."share_links"
  as permissive
  for insert
  to authenticated
with check ((created_by = ( SELECT auth.uid() AS uid)));



  create policy "Users can delete their share links"
  on "public"."share_links"
  as permissive
  for delete
  to authenticated
using ((created_by = ( SELECT auth.uid() AS uid)));



  create policy "Users can update their share links"
  on "public"."share_links"
  as permissive
  for update
  to authenticated
using ((created_by = ( SELECT auth.uid() AS uid)))
with check (((created_by = ( SELECT auth.uid() AS uid)) AND (share_token = ( SELECT old_sl.share_token
   FROM public.share_links old_sl
  WHERE (old_sl.id = share_links.id))) AND (wishlist_id = ( SELECT old_sl.wishlist_id
   FROM public.share_links old_sl
  WHERE (old_sl.id = share_links.id)))));



  create policy "Users who know the wishlist uuid can view the wishlist items"
  on "public"."wishlist_items"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.wishlists
  WHERE (wishlists.id = wishlist_items.wishlist_id))));



  create policy "Wishlist owners can delete items"
  on "public"."wishlist_items"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.wishlists w
  WHERE ((w.id = wishlist_items.wishlist_id) AND (w.author_id = ( SELECT auth.uid() AS uid))))));



  create policy "Wishlist owners can insert items"
  on "public"."wishlist_items"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.wishlists w
  WHERE ((w.id = wishlist_items.wishlist_id) AND (w.author_id = ( SELECT auth.uid() AS uid))))));



  create policy "Wishlist owners can update items"
  on "public"."wishlist_items"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.wishlists w
  WHERE ((w.id = wishlist_items.wishlist_id) AND (w.author_id = ( SELECT auth.uid() AS uid))))));



  create policy "Permission creators can grant permissions"
  on "public"."wishlist_permissions"
  as permissive
  for insert
  to authenticated
with check ((created_by = ( SELECT auth.uid() AS uid)));



  create policy "Permission creators can revoke permissions"
  on "public"."wishlist_permissions"
  as permissive
  for delete
  to authenticated
using ((created_by = ( SELECT auth.uid() AS uid)));



  create policy "Permission creators can update permissions"
  on "public"."wishlist_permissions"
  as permissive
  for update
  to authenticated
using ((created_by = ( SELECT auth.uid() AS uid)))
with check ((created_by = ( SELECT auth.uid() AS uid)));



  create policy "Permission creators can view permissions they created"
  on "public"."wishlist_permissions"
  as permissive
  for select
  to authenticated
using ((created_by = ( SELECT auth.uid() AS uid)));



  create policy "Users can view their own permissions"
  on "public"."wishlist_permissions"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Authenticated users can view wishlists via active share links"
  on "public"."wishlists"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.share_links
  WHERE ((share_links.wishlist_id = wishlists.id) AND (share_links.revoked_at IS NULL)))));



  create policy "Public can view wishlists via active share links"
  on "public"."wishlists"
  as permissive
  for select
  to anon
using ((EXISTS ( SELECT 1
   FROM public.share_links
  WHERE ((share_links.wishlist_id = wishlists.id) AND (share_links.revoked_at IS NULL)))));



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



  create policy "Users can view their own wishlists"
  on "public"."wishlists"
  as permissive
  for select
  to authenticated
using ((author_id = ( SELECT auth.uid() AS uid)));



  create policy "Users can view wishlists they have permission to access"
  on "public"."wishlists"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (public.wishlist_permissions wp
     JOIN public.permissions p ON ((wp.permission_id = p.id)))
  WHERE ((wp.wishlist_id = wishlists.id) AND (wp.user_id = ( SELECT auth.uid() AS uid)) AND ((p.name)::text = 'wishlist:view'::text)))));


CREATE TRIGGER assign_author_permissions_trigger AFTER INSERT ON public.wishlists FOR EACH ROW EXECUTE FUNCTION public.assign_author_permissions();


