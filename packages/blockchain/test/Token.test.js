/* eslint-disable no-undef */

const Token = artifacts.require('Token');
const expect = require('chai').use(require('chai-as-promised')).expect;

contract('Token', () => {
  let token;
  beforeEach(async () => {
    token = await Token.new();
  });

  const expectedResult = {
    name: 'TinyDEX',
    symbol: 'TDEX',
    decimals: 18,
    totalSupply: (21_000_000e18).toLocaleString('fullwide', {
      useGrouping: false,
    }),
  };

  describe('Deployment', () => {
    it('Should have a valid name', async () => {
      const result = await token.name();
      expect(result).to.equal(expectedResult.name);
    });
    it('Should have a valid symbol', async () => {
      const result = await token.symbol();
      expect(result).to.equal(expectedResult.symbol);
    });
    it('Should have valid decimals', async () => {
      const result = await token.decimals();
      expect(result.toNumber()).to.equal(expectedResult.decimals);
    });
    it('Should have a valid `totalSupply`', async () => {
      const result = await token.totalSupply();
      expect(result.toString()).to.equal(expectedResult.totalSupply);
    });
  });
});
