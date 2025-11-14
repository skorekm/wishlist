import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, SupabaseClient } from "jsr:@supabase/supabase-js";
import { SMTPClient } from "https://deno.land/x/denomailer/mod.ts";

function generateReminderEmailTemplate(
  name: string,
  wishlistLink: string,
  hoursRemaining: number,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .warning { 
            background-color: #FEF3C7; 
            padding: 15px; 
            border-radius: 6px; 
            margin: 20px 0;
            border-left: 4px solid #F59E0B;
          }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background-color: #DC2626; 
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
          <h2>⏰ Reservation Expiring Soon!</h2>
          <p>Hello ${name},</p>
          <div class="warning">
            <strong>Your wishlist item reservation will expire in approximately ${hoursRemaining} hours!</strong>
          </div>
          <p>Please mark the item as purchased if you've completed your purchase, or the reservation will be automatically cancelled and made available to others.</p>
          <a href="${wishlistLink}" class="button">View Wishlist & Confirm Purchase</a>
          <p>Or copy this link: <br/><code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 13px;">${wishlistLink}</code></p>
          <div class="footer">
            <p>Best regards,<br/>The Wishlist Team</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

const sendReminderEmail = async (
  email: string,
  name: string,
  wishlistLink: string,
  hoursRemaining: number,
) => {
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
      to: email,
      subject: `⏰ Your reservation expires in ${hoursRemaining} hours`,
      html: generateReminderEmailTemplate(name, wishlistLink, hoursRemaining),
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send reminder email", error);
    return { error: "Failed to send email" };
  } finally {
    await client.close();
  }
};

const getWishlistLink = async (
  supabase: SupabaseClient,
  wishlistId: number,
  reservationCode: string,
  origin: string
) => {
  const { data: shareLinkData, error } = await supabase
    .from("share_links")
    .select("share_token")
    .eq("wishlist_id", wishlistId)
    .is("revoked_at", null)
    .single();

  if (error || !shareLinkData) {
    return { error: 'Share link not found' };
  }

  return { 
    wishlistLink: `${origin}/wishlists/shared/${shareLinkData.share_token}?code=${reservationCode}` 
  };
};

Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Find reservations expiring in the next 11-13 hours
    // (12 hour window with 1 hour buffer on each side to ensure we catch them)
    const reminderWindowStart = new Date(Date.now() + 11 * 60 * 60 * 1000);
    const reminderWindowEnd = new Date(Date.now() + 13 * 60 * 60 * 1000);

    const { data: reservations, error } = await supabase
      .from("reservations")
      .select(`
        id,
        reserver_name,
        reserver_email,
        reservation_code,
        expires_at,
        wishlist_item:wishlist_items!inner(wishlist_id)
      `)
      .eq("status", "reserved")
      .gte("expires_at", reminderWindowStart.toISOString())
      .lte("expires_at", reminderWindowEnd.toISOString()) as { 
        data: Array<{
          id: number;
          reserver_name: string;
          reserver_email: string;
          reservation_code: string;
          expires_at: string;
          wishlist_item: { wishlist_id: number };
        }> | null;
        error: { message: string } | null;
      };

    if (error) {
      console.error("Error fetching reservations", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!reservations) {
      return new Response(
        JSON.stringify({ message: "No reservations found" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${reservations.length} reservations to remind`);
    
    const results = [];
    const origin = Deno.env.get("PUBLIC_SITE_URL") || "http://localhost:5173";

    for (const reservation of reservations) {
      const { wishlistLink, error: linkError } = await getWishlistLink(
        supabase,
        reservation.wishlist_item.wishlist_id,
        reservation.reservation_code,
        origin
      );

      if (linkError || !wishlistLink) {
        console.error(`Failed to get wishlist link for reservation ${reservation.id}`);
        results.push({ id: reservation.id, error: linkError });
        continue;
      }

      const hoursRemaining = Math.round(
        (new Date(reservation.expires_at).getTime() - Date.now()) / (1000 * 60 * 60)
      );

      const emailResult = await sendReminderEmail(
        reservation.reserver_email,
        reservation.reserver_name,
        wishlistLink,
        hoursRemaining
      );

      results.push({ 
        id: reservation.id, 
        email: reservation.reserver_email,
        hoursRemaining,
        ...emailResult 
      });
    }

    return new Response(
      JSON.stringify({ 
        message: `Processed ${results.length} reminders`,
        results 
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in reminder function", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});


