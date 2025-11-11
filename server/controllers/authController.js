import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import User from '../models/User.js';

// ✅ SAFE Resend initialization with your actual API key
let resend;
let emailServiceReady = false;

try {
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith('re_')) {
    resend = new Resend(process.env.RESEND_API_KEY);
    emailServiceReady = true;
    console.log('✅ Resend email service initialized successfully');
  } else {
    console.log('⚠️  Resend API key not properly configured');
  }
} catch (error) {
  console.error('❌ Resend initialization failed:', error.message);
}

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset link to user's email
 * @access  Public
 */
export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    // Step 1: Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Security: Don't reveal if email exists or not
      return res.status(200).json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    // Step 2: Generate a short-lived reset token (JWT)
    const resetToken = jwt.sign(
      { id: user.id, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Step 3: Construct password reset link
    const resetURL = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    // Step 4: Send email if service is ready
    if (emailServiceReady && resend) {
      try {
        const { error } = await resend.emails.send({
          from: 'AfyaLink Support <onboarding@resend.dev>',
          to: user.email,
          subject: 'Password Reset Request - AfyaLink',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Password Reset Request</h2>
              <p>Hello <strong>${user.firstName}</strong>,</p>
              <p>You requested a password reset for your AfyaLink account.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetURL}" 
                   style="background-color: #2563eb; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 6px; display: inline-block;">
                  Reset Password
                </a>
              </div>
              <p><strong>Note:</strong> This link expires in 15 minutes.</p>
              <p>If you didn't request this, please ignore this email.</p>
              <br/>
              <p>— The AfyaLink Team</p>
            </div>
          `,
        });

        if (error) {
          console.error('❌ Resend email error:', error);
          // Continue with success response but log the error
        } else {
          console.log('✅ Password reset email sent to:', user.email);
        }
      } catch (emailError) {
        console.error('❌ Email sending error:', emailError);
      }
    } else {
      console.log('📧 Email service not ready. Reset URL for testing:', resetURL);
    }

    // Always return success for security
    res.status(200).json({ 
      message: 'If an account with that email exists, a password reset link has been sent.',
      ...(process.env.NODE_ENV === 'development' && { resetURL })
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ message: 'Server error processing your request' });
  }
};

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset user password using token
 * @access  Public
 */
export const resetPasswordController = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token) return res.status(400).json({ message: 'Token is required' });
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Find user
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update password
    await user.update({ password: newPassword });

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};