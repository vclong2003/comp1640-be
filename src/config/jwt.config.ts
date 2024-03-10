enum EJwtConfigKey {
  // access token
  AccessTokenSecret = 'accessTokenSecret',
  AccessTokenExpire = 'accessTokenExpire',
  //refresh token
  RefreshTokenSecret = 'refreshTokenSecret',
  //register token
  RegisterTokenSecret = 'registerTokenSecret',
  RegisterTokenExpire = 'registerTokenExpire',
}

const jwtConfig = async () => ({
  [EJwtConfigKey.AccessTokenSecret]: process.env.JWT_ACCESS_SECRET,
  [EJwtConfigKey.AccessTokenExpire]: process.env.JWT_ACCESS_EXPIRE,

  [EJwtConfigKey.RefreshTokenSecret]: process.env.JWT_REFRESH_SECRET,

  [EJwtConfigKey.RegisterTokenSecret]: process.env.JWT_REGISTER_SECRET,
  [EJwtConfigKey.RegisterTokenExpire]: process.env.JWT_REGISTER_EXPIRE,
});

export { EJwtConfigKey };
export default jwtConfig;
