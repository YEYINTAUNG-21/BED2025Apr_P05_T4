const Joi = require('joi');
const xss = require('xss');
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mssql = require('mssql');
const path = require('path'); // Import path module
require('dotenv').config();

// Initialize the app
const app = express();
const port = 3000;

// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the "frontend/html" directory
app.use(express.static(path.join(__dirname, '../../frontend/html')));

// MSSQL Configuration from .env
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT, 10),
  options: {
    encrypt: true,  // Use encryption
    trustServerCertificate: true  // Trust the self-signed certificate
  }
};


// Nodemailer Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Route to serve the contact form page (frontend)
app.get('/', (req, res) => {
  // Serve the contact.html from frontend/html directory
  res.sendFile(path.join(__dirname, '../../frontend/html/contact.html'));
});

// Handle form submission
app.post('/submit', async (req, res) => {
  // Get the form data
  const { email, subject, description } = req.body;

  // Sanitize inputs to prevent XSS (Cross-site scripting)
  const sanitizedEmail = xss(email);
  const sanitizedSubject = xss(subject);
  const sanitizedDescription = xss(description);

  // Validate the input fields using Joi
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please enter a valid email address.',
      'any.required': 'Email is required.'
    }),
    subject: Joi.string().min(1).max(255).required().messages({
      'string.min': 'Subject must be at least 1 character long.',
      'string.max': 'Subject cannot exceed 255 characters.',
      'any.required': 'Subject is required.'
    }),
    description: Joi.string().min(1).required().messages({
      'string.min': 'Description must be at least 1 character long.',
      'any.required': 'Description is required.'
    })
  });

  // Validate input data against the Joi schema
  const { error } = schema.validate({
    email: sanitizedEmail,
    subject: sanitizedSubject,
    description: sanitizedDescription
  });

  // If validation fails, return an error message
  if (error) {
    return res.status(400).send(`Invalid input: ${error.details[0].message}`);
  }

  try {
    // Connect to MSSQL
    await mssql.connect(dbConfig);

    // Insert survey response into the database
    await mssql.query(`
      INSERT INTO SurveyResponses (email, subject, description)
      VALUES ('${sanitizedEmail}', '${sanitizedSubject}', '${sanitizedDescription}')
    `);

    // Email content to send back as a receipt
// Email content to send back as a receipt with an embedded logo image
// Email content to send back as a receipt with an inline image
// Email content to send back as a receipt with an inline image (using CID)
// Email content to send back as a receipt with an inline image
const mailOptions = {
  from: process.env.SMTP_USER,
  to: sanitizedEmail,
  subject: 'Thank you for contacting us!',
  html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; max-width: 600px; margin: 0 auto;">
      <!-- Reference the image with cid, which will render it inline -->
      <img src="cid:logo" alt="Logo" style="width: 300px; display: block; margin: 0 auto;" />
      <h1 style="color: #000000ff;">Thank you for contacting us!</h1>
      <p>We have received your submission with the following details. Our support team will review your message and get back to you shortly.</p>
      <p><strong>Subject:</strong> ${sanitizedSubject}</p>
      <p><strong>Description:</strong> ${sanitizedDescription}</p>
      <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
      <hr>
      <p style="color: #888;">Thank you for contacting us. We appreciate your feedback!</p>
    </div>
  `,
  attachments: [
    {
      filename: 'logo.jpeg',  // Image file name
      path: path.join(__dirname, 'images/logo.jpeg'),  // Path to image in your server
      cid: 'logo'  // Content-ID for inline embedding
    }
  ]
};

// Serve the image from the 'images' folder publicly
app.use('/images', express.static(path.join(__dirname, 'images')));

// Send the email receipt
await transporter.sendMail(mailOptions);
res.send('Thank you for your submission! A receipt has been sent to your email.');




    // After success, redirect to contact.html
    res.redirect('../../frontend/html/index.html');
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Something went wrong. Please try again.');
  }
});




// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
