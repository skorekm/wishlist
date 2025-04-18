create table "public"."wishlists" (
    "id" integer generated always as identity not null,
    "name" character varying(100) not null,
    "description" character varying(250),
    "authorId" uuid,
    "createdAt" timestamp without time zone not null default now(),
    "updatedAt" timestamp without time zone not null default now()
);


CREATE UNIQUE INDEX wishlist_pkey ON public.wishlists USING btree (id);

alter table "public"."wishlists" add constraint "wishlist_pkey" PRIMARY KEY using index "wishlist_pkey";

alter table "public"."wishlists" add constraint "wishlists_authorId_users_id_fk" FOREIGN KEY ("authorId") REFERENCES auth.users(id) not valid;

alter table "public"."wishlists" validate constraint "wishlists_authorId_users_id_fk";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$function$
;

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


