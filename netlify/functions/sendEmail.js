const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // 1. The "Logic Gate" for CORS (Pre-flight Probe)
  const headers = {
    "Access-Control-Allow-Origin": "*", // Allow any frontend to pulse this server
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body);
    const { to, subject, message, xAuthKey } = data; 

    const secretKey = process.env.COMM_KEY;

    // 2. Auth Signal Check
    if (!xAuthKey || xAuthKey !== secretKey) {
        return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: "Signal Mismatch: Invalid Auth Key" })
        };
    }
    
    // 3. The SMTP Transformer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, 
        pass: process.env.GMAIL_PASS 
      }
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: to,
      subject: subject,
      text: message
    };

    // 4. Send the Pulse
    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Email sent successfully!" })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};