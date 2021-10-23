export const truncateAddress = (address: string): string => {
  return address.substr(0, 6) + "..." + address.substr(address.length - 5);
};

export const negativeString = (input: string): string =>
  input[0] === "-" || input.length === 0 ? input.substr(1) : `-${input}`;
