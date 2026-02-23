const nodemailer = require('nodemailer');

// Create Gmail transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

/**
 * Send password change notification email
 * @param {string} to - User's email address
 * @param {string} userName - User's full name
 * @param {Date} changeTime - When the password was changed
 */
const sendPasswordChangeNotification = async (to, userName, changeTime) => {
  try {
    const transporter = createTransporter();
    
    const formattedTime = new Date(changeTime).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });

    const mailOptions = {
      from: `"ShoeStore Security" <${process.env.GMAIL_USER}>`,
      to,
      subject: '🔐 Password Changed - ShoeStore Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: #3b82f6; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🔐 Password Changed</h1>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              Hello <strong>${userName}</strong>,
            </p>
            
            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              Your ShoeStore account password was successfully changed on:
            </p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="font-size: 18px; color: #1f2937; font-weight: bold; margin: 0;">
                ${formattedTime}
              </p>
            </div>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>⚠️ Didn't make this change?</strong><br>
                If you didn't change your password, please contact us immediately at 
                <a href="mailto:support@shoestore.com" style="color: #2563eb;">support@shoestore.com</a>
                or reset your password right away.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              This is an automated security notification from ShoeStore.<br>
              Please do not reply to this email.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>&copy; 2024 ShoeStore. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password change email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send password change email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send welcome email to new sellers
 * @param {string} to - Seller's email address
 * @param {string} storeName - Store name
 */
const sendSellerWelcomeEmail = async (to, storeName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"ShoeStore Seller Team" <${process.env.GMAIL_USER}>`,
      to,
      subject: '🎉 Welcome to ShoeStore Seller Program!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #3b82f6;">Welcome, ${storeName}!</h1>
          <p>Your seller account has been created. You can now start adding products to your store.</p>
          <a href="${process.env.CLIENT_URL}/seller" 
             style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; margin-top: 20px;">
            Go to Seller Dashboard
          </a>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send seller welcome email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPasswordChangeNotification,
  sendSellerWelcomeEmail,
};
