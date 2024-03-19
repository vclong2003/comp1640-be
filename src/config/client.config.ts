enum EClientConfigKeys {
  Url = 'clientUrl',
}

const clientConfig = () => ({
  [EClientConfigKeys.Url]: process.env.CLIENT_URL,
});

export { EClientConfigKeys };
export default clientConfig;
