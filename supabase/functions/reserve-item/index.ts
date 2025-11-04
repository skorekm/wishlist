import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import * as crypto from "jsr:@std/crypto";
import { createClient } from "jsr:@supabase/supabase-js";
import { SMTPClient } from "https://deno.land/x/denomailer/mod.ts";

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const { email, name, itemId } = await req.json();

    // Check if the item is already reserved by the user. If so, return an error.
    const { data: reservation, error: reservationError } = await supabase
      .from("reservations")
      .select("*")
      .eq("wishlist_item_id", itemId)
      .eq("status", "reserved")

    if (reservation && reservation.length > 0) {
      return new Response(JSON.stringify({ error: "Item already reserved" }), {
        status: 400,
      });
    }

    if (reservationError) {
      console.error("Error checking reservation", reservationError);
      return new Response(JSON.stringify({ error: reservationError.message }), {
        status: 500,
      });
    }

    // Generate a unique reservation code
    const reservationCode = crypto.crypto.randomUUID();

    // Reserve the item for the user for 48 hours. Take care of the timezone difference.
    const { data: newReservation, error: newReservationError } = await supabase
      .from("reservations")
      .insert({
        wishlist_item_id: itemId,
        reserver_email: email,
        reserver_name: name,
        reservation_code: reservationCode,
        // 48 hours from now
        expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        status: "reserved",
      })
      .select()
      .single();

    if (newReservationError) {
      console.error("Error reserving item", newReservationError);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
      });
    }

    // Get the origin from the request headers
    const origin = req.headers.get('origin') || new URL(req.url).origin;
    const { reservation_code, wishlist_item_id } = newReservation;

    // Get the wishlist_id from the wishlist_item
    const { data: wishlistItem, error: wishlistItemError } = await supabase
      .from("wishlist_items")
      .select("wishlist_id")
      .eq("id", wishlist_item_id)
      .single();

    if (wishlistItemError || !wishlistItem) {
      console.error("Error fetching wishlist item", wishlistItemError);
      return new Response(JSON.stringify({ error: "Item not found" }), {
        status: 404,
      });
    }

    // Get the share token for the wishlist
    const { data: shareLink, error: shareLinkError } = await supabase
      .from("share_links")
      .select("share_token")
      .eq("wishlist_id", wishlistItem.wishlist_id)
      .single();

    if (shareLinkError || !shareLink) {
      console.error("Error fetching share token", shareLinkError);
      return new Response(JSON.stringify({ error: "Share link not found" }), {
        status: 404,
      });
    }

    const wishlistLink = `${origin}/wishlists/shared/${shareLink.share_token}?code=${reservation_code}`;

    // Send an email to the user with the reservation details
    // Wrap in try-catch so email failures don't fail the reservation
    try {
      const client = new SMTPClient({
        connection: {
          hostname: "host.docker.internal",
          port: 54325,
          tls: false,
        },
        debug: {
          allowUnsecure: true,
        }
      });

      await client.send({
        from: "admin@wishlist.com",
        to: newReservation.reserver_email,
        subject: "Your reservation details",
        html: `
        <p>Here's the link you can use to set item as purchased:</p>
        <a href="${wishlistLink}">${wishlistLink}</a>
        <p>This link will expire in 48 hours.</p>
        <p>If you have any questions, please contact us at <a href="mailto:support@wishlist.com">support@wishlist.com</a>.</p>
        <p>Thank you for your reservation!</p>
        <p>Best regards,<br/>
        Wishlist Team</p>
      `,
      });

      await client.close();
    } catch (emailError) {
      // Log the error but don't fail the reservation
      console.error("Failed to send email:", emailError);
    }

    return new Response(
      JSON.stringify({ message: "Item reserved successfully" }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error reserving item", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
});
