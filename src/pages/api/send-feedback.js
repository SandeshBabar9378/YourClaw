import { Resend } from "resend";

export async function POST({ request }) {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
        return new Response(JSON.stringify({ error: "All fields are required!" }), { status: 400 });
    }

    const resend = new Resend(import.meta.env.RESEND_API_KEY);

    try {
        await resend.emails.send({
            from: "info@yourclaw.tech",
            to: "info@yourclaw.tech", // Apna email yaha daal
            replyTo: email,
            subject: "New Feedback Received!",
            html: `<p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Message:</strong> ${message}</p>`,
        });

        return new Response(JSON.stringify({ success: "Feedback sent successfully!" }), { status: 200 });

    } catch (error) {
        console.error("Error sending email:", error);
        return new Response(JSON.stringify({ error: "Failed to send feedback!" }), { status: 500 });
    }
}
