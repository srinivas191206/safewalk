import type { VercelRequest, VercelResponse } from '@vercel/node';
import Twilio from 'twilio';

// Initialize Twilio client
// NOTE: These must be set in your Vercel Environment Variables
// WhatsApp Automation Gateways
// Option 1: Self-Hosted (WAHA, Wauapi, etc.) - FREE if you host it
const waApiUrl = process.env.WHATSAPP_API_URL;
const waApiKey = process.env.WHATSAPP_API_KEY;

// Option 2: UltraMsg (Paid, but very reliable/easy)
const waGatewayToken = process.env.WHATSAPP_GATEWAY_TOKEN;
const waGatewayInstance = process.env.WHATSAPP_GATEWAY_INSTANCE;

// Twilio Config (For SMS and Fallback WhatsApp)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    // CORS Configuration - Allow all for emergency safety app testing
    response.setHeader('Access-Control-Allow-Origin', '*');

    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
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

        // Send SMS/WhatsApp to each contact
        await Promise.all(
            contacts.map(async (contact: any) => {
                try {
                    const to = contact.phone;

                    // Send standard SMS
                    await client.messages.create({
                        body: `${message}\n\n[Sent via Safety Net Connect]`,
                        from: fromNumber,
                        to: to,
                    });

                    // Automated WhatsApp Logic
                    if (contact.whatsapp_enabled || contact.whatsappEnabled) {
                        try {
                            if (waApiUrl) {
                                // Priority A: Self-Hosted Waqapi/WAHA (Free)
                                await fetch(`${waApiUrl}/sendText`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        // Some APIs use X-Api-Key, others use Authorization
                                        'X-Api-Key': waApiKey || '',
                                        'Authorization': `Bearer ${waApiKey}`
                                    },
                                    body: JSON.stringify({
                                        chatId: `${to.replace('+', '')}@c.us`,
                                        text: `${message}\n\n[Sent via Safety Net Automated Gateway]`,
                                        session: 'safewalk' // Matches setup-whatsapp-bot.sh
                                    }),
                                });
                                console.log(`Self-hosted WhatsApp sent to ${to}`);
                            } else if (waGatewayToken && waGatewayInstance) {
                                // Priority B: UltraMsg (Paid Gateway)
                                await fetch(`https://api.ultramsg.com/${waGatewayInstance}/messages/chat`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                    body: new URLSearchParams({
                                        token: waGatewayToken,
                                        to: to.replace('+', ''),
                                        body: `${message}\n\n[Sent via Safety Net Automated Gateway]`,
                                    }),
                                });
                                console.log(`UltraMsg WhatsApp sent to ${to}`);
                            } else {
                                // Priority C: Twilio WhatsApp (Requires Sandbox join)
                                const whatsappFrom = fromNumber.startsWith('whatsapp:')
                                    ? fromNumber
                                    : `whatsapp:${fromNumber}`;

                                await client.messages.create({
                                    body: `${message}\n\n[Sent via Safety Net Connect]`,
                                    from: whatsappFrom,
                                    to: `whatsapp:${to}`,
                                });
                                console.log(`Twilio WhatsApp sent to ${to}`);
                            }
                        } catch (waError) {
                            console.error(`WhatsApp automation failed for ${to}:`, waError);
                        }
                    }

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
