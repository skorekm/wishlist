import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { crypto } from "jsr:@std/crypto";
import { createClient, SupabaseClient } from "jsr:@supabase/supabase-js";
import { SMTPClient } from "https://deno.land/x/denomailer/mod.ts";

const checkExistingReservation = async (supabase: SupabaseClient, itemId: string) => {
  const { data, error } = await supabase
    .from("reservations")
    .select("id, expires_at")
    .eq("wishlist_item_id", itemId)
    .eq("status", "reserved")
    .gt("expires_at", new Date().toISOString()) // Only count non-expired reservations
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
  wishlistEventDate: string | null,
  userId: string | null = null,
) => {
  const reservationCode = crypto.randomUUID();
  
  // Calculate expiration: default is 48 hours from now
  let expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
  
  // If wishlist has an event date, ensure reservation doesn't exceed it
  if (wishlistEventDate) {
    const eventDate = new Date(wishlistEventDate);
    // Set to end of the event day (23:59:59)
    eventDate.setHours(23, 59, 59, 999);
    
    // Use the earlier of the two dates
    if (eventDate < expiresAt) {
      expiresAt = eventDate;
    }
  }

  const { data, error } = await supabase
    .from("reservations")
    .insert({
      wishlist_item_id: itemId,
      reserver_name: name,
      reserver_email: email,
      reservation_code: reservationCode,
      expires_at: expiresAt.toISOString(),
      status: "reserved",
      user_id: userId,
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
  expiresAt: string,
  origin: string,
): string {
  const expirationDate = new Date(expiresAt);
  const formattedDate = expirationDate.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

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
          <p>You can view the wishlist and update the reservation status at any time using the link below:</p>
          <a href="${wishlistLink}" class="button">View Wishlist & Manage Reservation</a>
          <p>Or copy this link: <br/><code>${wishlistLink}</code></p>
          <p><strong>Important:</strong> This reservation will expire on ${formattedDate}.</p>
          <div class="footer">
            <p>If you have any questions, please contact us at:
              <a href="mailto:admin@wishlist.com">admin@wishlist.com</a>
            </p>
            <p>Best regards,<br/>The Wishlist Team</p>
            
            <!-- Legal Footer (CAN-SPAM Compliance) -->
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af;">
              <p style="margin: 5px 0;">Wishlist</p>
              <p style="margin: 5px 0;">For support, contact us at admin@wishlist.com</p>
              <p style="margin: 10px 0 5px 0;">
                <a href="${origin}/privacy" style="color: #6366f1; text-decoration: none;">Privacy Policy</a> | 
                <a href="${origin}/terms" style="color: #6366f1; text-decoration: none;">Terms of Service</a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

const sendReservationEmail = async (wishlistLink: string, reserverEmail: string, reserverName: string, expiresAt: string, origin: string) => {
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
      subject: "✓ Wishlist Item Reserved - Confirmation",
      html: generateEmailTemplate(reserverName, wishlistLink, expiresAt, origin),
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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    
    // Get the authenticated user if present
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      try {
        // Create a temporary client with anon key and user's JWT for auth validation
        const userClient = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!,
          {
            global: {
              headers: {
                Authorization: authHeader,
              },
            },
          }
        );
        
        // Validate token and extract user.id
        const { data: { user }, error } = await userClient.auth.getUser();
        
        if (!error && user) {
          userId = user.id;
        }
      } catch (error) {
        // Invalid token - userId remains null
        console.warn("Failed to validate user token:", error);
      }
    }
    
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

    // Fetch the wishlist's event_date
    const { data: itemData, error: itemError } = await supabase
      .from("wishlist_items")
      .select("wishlist_id")
      .eq("id", itemId)
      .single();

    if (itemError || !itemData) {
      console.error("Error fetching wishlist item:", itemError);
      return new Response(JSON.stringify({ error: "Failed to find wishlist item" }), {
        status: 500,
      });
    }

    const { data: wishlistData, error: wishlistError } = await supabase
      .from("wishlists")
      .select("event_date")
      .eq("id", itemData.wishlist_id)
      .single();

    if (wishlistError) {
      console.error("Error fetching wishlist:", wishlistError);
      return new Response(JSON.stringify({ error: "Failed to find wishlist" }), {
        status: 500,
      });
    }

    // Check if the event date has already passed
    if (wishlistData?.event_date) {
      const eventDate = new Date(wishlistData.event_date);
      eventDate.setHours(23, 59, 59, 999); // End of the event day
      
      if (eventDate < new Date()) {
        return new Response(JSON.stringify({ error: "Cannot reserve items for past events" }), {
          status: 400,
        });
      }
    }

    const { data: newReservation, error: createReservationError } = await createReservation(
      supabase, 
      email, 
      name, 
      itemId, 
      wishlistData?.event_date || null,
      userId
    );

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

    const emailResult = await sendReservationEmail(wishlistLink, email, name, newReservation.expires_at, origin);
    if (emailResult.error) {
      console.error('Failed to send reservation email', emailResult.error);
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
