enum EPasswordConfigKey {
  Rounds = 'pwd-rounds',
}

const passwordConfig = () => ({
  [EPasswordConfigKey.Rounds]: parseInt(process.env.PASSWORD_ROUNDS),
});

export { EPasswordConfigKey };
export default passwordConfig;
