import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import * as crypto from "jsr:@std/crypto";
import { createClient, SupabaseClient } from "jsr:@supabase/supabase-js";
import { SMTPClient } from "https://deno.land/x/denomailer/mod.ts";

const checkExistingReservation = async (supabase: SupabaseClient, itemId: string) => {
  const { data, error } = await supabase
    .from("reservations")
    .select("id")
    .eq("wishlist_item_id", itemId)
    .eq("status", "reserved")
    .maybeSingle();

  if (error) {
    return { exists: false, error: error.message };
  }

  return { exists: !!data };
}

const createReservation = async (
  supabase: SupabaseClient,
  email: string,
  name: string,
  itemId: string,
) => {
  const reservationCode = crypto.crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("reservations")
    .insert({
      wishlist_item_id: itemId,
      reserver_name: name,
      reserver_email: email,
      reservation_code: reservationCode,
      expires_at: expiresAt,
      status: "reserved",
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }
  return { data };
}

const getWishlistLink = async (supabase: SupabaseClient, itemId: string, reservationCode: string, origin: string) => {
  // First, get the wishlist_id from the item
  const { data: itemData, error: itemError } = await supabase
    .from("wishlist_items")
    .select("wishlist_id")
    .eq("id", itemId)
    .single();

  if (itemError || !itemData) {
    console.error("Error fetching wishlist item:", itemError);
    return { error: 'Failed to find wishlist item' };
  }

  // Then get the share token for that wishlist
  const { data: shareLinkData, error: shareLinkError } = await supabase
    .from("share_links")
    .select("share_token")
    .eq("wishlist_id", itemData.wishlist_id)
    .is("revoked_at", null)
    .single();

  if (shareLinkError || !shareLinkData) {
    console.error("Error fetching share link:", shareLinkError);
    return { error: 'Share link not found' };
  }

  return { wishlistLink: `${origin}/wishlists/shared/${shareLinkData.share_token}?code=${reservationCode}` };
};

function generateEmailTemplate(
  name: string,
  wishlistLink: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background-color: #4F46E5; 
            color: white; 
            text-decoration: none; 
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer { margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Hello ${name}! 👋</h2>
          <p>Thank you for reserving an item from the wishlist.</p>
          <p>Use the link below to mark the item as purchased once you've completed your purchase:</p>
          <a href="${wishlistLink}" class="button">View Wishlist & Confirm Purchase</a>
          <p>Or copy this link: <br/><code>${wishlistLink}</code></p>
          <p><strong>Important:</strong> This reservation will expire in 48 hours.</p>
          <div class="footer">
            <p>If you have any questions, please contact us at:
              <a href="mailto:support@wishlist.com">support@wishlist.com</a>
            </p>
            <p>Best regards,<br/>The Wishlist Team</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

const sendReservationEmail = async (wishlistLink: string, reserverEmail: string, reserverName: string) => {
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

  try {
    await client.send({
      from: "admin@wishlist.com",
      to: reserverEmail,
      subject: "Your reservation details",
      html: generateEmailTemplate(reserverName, wishlistLink),
    });
  } catch (error) {
    console.error("Failed to send email", error);
    return { error: "Failed to send email" };
  } finally {
    await client.close();
  }
  return { success: true };
};

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const { email, name, itemId } = await req.json();

    const { exists, error: reservationError } = await checkExistingReservation(supabase, itemId);

    if (reservationError) {
      console.error("Error checking existing reservation", reservationError);
      return new Response(JSON.stringify({ error: reservationError }), {
        status: 500,
      });
    }

    if (exists) {
      return new Response(JSON.stringify({ error: "Item already reserved" }), {
        status: 409,
      });
    }

    const { data: newReservation, error: createReservationError } = await createReservation(supabase, email, name, itemId);

    if (createReservationError) {
      console.error("Error creating reservation", createReservationError);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
      });
    }

    const origin = req.headers.get("origin") || new URL(req.url).origin;
    const { wishlistLink } = await getWishlistLink(supabase, itemId, newReservation.reservation_code, origin);
    if (!wishlistLink) {
      return new Response(JSON.stringify({ error: "Failed to generate wishlist link" }), {
        status: 500,
      });
    }

    await sendReservationEmail(wishlistLink, email, name);

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
