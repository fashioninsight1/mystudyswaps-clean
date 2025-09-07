import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export class EmailService {
  async sendChildCredentials(parentEmail: string, parentName: string, children: any[]) {
    const html = `
      <h1>Welcome to My Study Swaps!</h1>
      <p>Hi ${parentName},</p>
      <p>Your child accounts have been created successfully:</p>
      
      ${children.map(child => `
        <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0;">
          <h3>${child.firstName} ${child.lastName}</h3>
          <p><strong>Username:</strong> ${child.username}</p>
          <p><strong>Password:</strong> ${child.password}</p>
          <p><strong>Age:</strong> ${child.age} | <strong>Key Stage:</strong> ${child.keyStage}</p>
        </div>
      `).join('')}
      
      <p>Children can log in at: <a href="${process.env.SITE_URL}/child-login">${process.env.SITE_URL}/child-login</a></p>
      <p>Best regards,<br>My Study Swaps Team</p>
    `;

    const msg = {
      to: parentEmail,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: 'Your My Study Swaps Child Account Details',
      html
    };

    try {
      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('Email service error:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
