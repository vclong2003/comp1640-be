enum EMailConfigKey {
  SmtpHost = 'smtp-host',
  SmtpPort = 'smtp-port',
  SmtpUser = 'smtp-user',
  SmtpPass = 'smtp-pass',
}

const mailConfig = () => ({
  [EMailConfigKey.SmtpHost]: process.env.SMTP_HOST,
  [EMailConfigKey.SmtpPort]: parseInt(process.env.SMTP_PORT),
  [EMailConfigKey.SmtpUser]: process.env.SMTP_USER,
  [EMailConfigKey.SmtpPass]: process.env.SMTP_PASS,
});

export { EMailConfigKey };
export default mailConfig;
