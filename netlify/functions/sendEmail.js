const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body);
    const { to, subject, message, xAuthKey } = data; 

    const secretKey = process.env.COMM_KEY;

    if (!xAuthKey || xAuthKey !== secretKey) {
        return {
            statusCode: 401, 
            body: JSON.stringify({ error: "Signal Mismatch: Invalid Auth Key" })
        };
    }
    
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

    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email sent successfully!" })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};




