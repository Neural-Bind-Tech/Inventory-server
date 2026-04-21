export const getResetPasswordEmailHtml = (resetLink: string) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2 style="margin-bottom: 8px;">Reset your password</h2>
      <p style="margin: 0 0 12px;">You requested to reset your account password.</p>
      <p style="margin: 0 0 16px;">
        Click the button below to continue. This link expires shortly for security reasons.
      </p>
      <a
        href="${resetLink}"
        style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 10px 16px; border-radius: 8px;"
      >
        Reset Password
      </a>
      <p style="margin: 16px 0 0; font-size: 12px; color: #6b7280;">
        If you did not request this, you can safely ignore this email.
      </p>
    </div>
  `;
};
