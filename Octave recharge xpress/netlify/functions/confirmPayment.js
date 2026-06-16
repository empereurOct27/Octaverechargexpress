const twilio = require('twilio');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { service, phone, montant, operateur } = body;
  if (!service || !phone || !montant || !operateur) {
    return { statusCode: 400, body: 'Missing fields' };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  const to = process.env.OWNER_WHATSAPP_TO;

  const message = `NOUVEAU PAIEMENT RECU\nOperateur: ${operateur}\nService: ${service}\nNumero: ${phone}\nMontant: ${montant} FCFA`;

  if (!accountSid || !authToken || !from || !to) {
    console.log('Twilio non configuré. Message:', message);
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, note: 'Twilio non configuré, message loggé côté fonction.' })
    };
  }

  try {
    const client = twilio(accountSid, authToken);
    await client.messages.create({
      from,
      to,
      body: message
    });
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ success: false, error: err.message }) };
  }
};