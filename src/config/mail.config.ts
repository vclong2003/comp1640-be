enum EMailConfigKey {
  Host = 'host',
  Port = 'port',
  User = 'user',
  Pass = 'pass',
}

const mailConfig = () => ({
  [EMailConfigKey.Host]: process.env.MAIL_HOST,
  [EMailConfigKey.Port]: parseInt(process.env.MAIL_PORT),
  [EMailConfigKey.User]: process.env.MAIL_USER,
  [EMailConfigKey.Pass]: process.env.MAIL_PASS,
});

export { EMailConfigKey };
export default mailConfig;
