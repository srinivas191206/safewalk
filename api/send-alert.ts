import type { VercelRequest, VercelResponse } from '@vercel/node';
import Twilio from 'twilio';

// Initialize Twilio client
// NOTE: These must be set in your Vercel Environment Variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    // enable CORS
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (request.method === 'OPTIONS') {
        response.status(200).end();
        return;
    }

    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { contacts, location, message } = request.body;

        if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
            return response.status(400).json({ error: 'No contacts provided' });
        }

        if (!accountSid || !authToken || !fromNumber) {
            console.error('Missing Twilio credentials');
            return response.status(500).json({
                error: 'Server configuration error: Missing Twilio credentials',
                details: 'TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER must be set in env vars'
            });
        }

        const client = Twilio(accountSid, authToken);
        const errors: any[] = [];
        const successes: any[] = [];

        // Send SMS to each contact
        await Promise.all(
            contacts.map(async (contact: any) => {
                try {
                    // Format phone number (ensure it has country code if missing, simplified for demo)
                    const to = contact.phone;

                    await client.messages.create({
                        body: `${message}\n\n[Sent via Safety Net Connect]`,
                        from: fromNumber,
                        to: to,
                    });
                    successes.push({ phone: to, status: 'sent' });
                } catch (error) {
                    console.error(`Failed to send to ${contact.phone}:`, error);
                    errors.push({ phone: contact.phone, error: error });
                }
            })
        );

        return response.status(200).json({
            success: true,
            results: {
                sent: successes.length,
                failed: errors.length,
                details: successes
            }
        });

    } catch (error) {
        console.error('Error processing SOS:', error);
        return response.status(500).json({ error: 'Internal server error' });
    }
}
