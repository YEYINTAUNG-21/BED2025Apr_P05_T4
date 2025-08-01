const sql = require('mssql');
const dbConfig = require('../../dbConfig');
const { sendEmail } = require('../services/emailService');

exports.submitFeedback = async (req, res) => {
  const { email, subject, description } = req.body;

  try {
    await sql.connect(dbConfig);
    const result = await sql.query`
      INSERT INTO Feedbacks (email, subject, description)
      OUTPUT INSERTED.id, INSERTED.submitted_at
      VALUES (${email}, ${subject}, ${description})
    `;

    const { id, submitted_at } = result.recordset[0];
    const refId = 'FB-' + id;
    const timestamp = new Date(submitted_at).toLocaleString();

    await sendEmail({
      to: email,
      subject: 'Thank You for Contacting Lion Befrienders',
      html: `
        <h2>Thank you for contacting us!</h2>
        <p>We’ve received your message and will respond soon.</p>
        <div style="background:#f0f0f0;padding:12px;border-radius:6px;">
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Description:</strong> ${description}</p>
          <p><strong>Reference ID:</strong> ${refId}</p>
          <p><strong>Submitted:</strong> ${timestamp}</p>
        </div>
      `
    });

    res.status(200).json({ message: 'Feedback submitted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Submission failed.' });
  }
};
