enum EApiConfigKey {
  Url = 'apiUrl',
  Port = 'port',
  MongoDbUri = 'mongoUri',
}

const apiConfig = () => ({
  [EApiConfigKey.Port]: parseInt(process.env.PORT),
  [EApiConfigKey.MongoDbUri]: process.env.MONGODB_URI,
  [EApiConfigKey.Url]: process.env.API_URL,
});

export { EApiConfigKey };
export default apiConfig;
