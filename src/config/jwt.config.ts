enum EJwtConfigKey {
  // access token
  AccessTokenSecret = 'accessTokenSecret',
  AccessTokenExpire = 'accessTokenExpire',
  AccessTokenCookieName = 'accessTokenCookieName',
  //refresh token
  RefreshTokenSecret = 'refreshTokenSecret',
  RefreshTokenCookieName = 'refreshTokenCookieName',
}

const jwtConfig = async () => ({
  [EJwtConfigKey.AccessTokenSecret]: process.env.JWT_ACCESS_SECRET,
  [EJwtConfigKey.AccessTokenExpire]: process.env.JWT_ACCESS_EXPIRE,
  [EJwtConfigKey.AccessTokenCookieName]: process.env.JWT_ACCESS_COOKIE_NAME,

  [EJwtConfigKey.RefreshTokenSecret]: process.env.JWT_REFRESH_SECRET,
  [EJwtConfigKey.RefreshTokenCookieName]: process.env.JWT_REFRESH_COOKIE_NAME,
});

export { EJwtConfigKey };
export default jwtConfig;
