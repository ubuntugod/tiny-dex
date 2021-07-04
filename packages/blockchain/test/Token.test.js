/* eslint-disable no-undef */
const Token = artifacts.require('Token');
const expect = require('chai').use(require('chai-as-promised')).expect;

const BN = web3.utils.BN;
const toBN = (number) => new BN(web3.utils.toWei(number.toString(), 'ether'));

contract('Token', (accounts) => {
  let token;
  beforeEach(async () => {
    token = await Token.new();
  });

  const expectedResult = {
    name: 'TinyDEX',
    symbol: 'TDEX',
    decimals: 18,
    totalSupply: toBN(21_000_000),
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
      expect(result.toString()).to.equal(expectedResult.totalSupply.toString());
    });

    it('Should set the totalSupply to the account balance of the deployer', async () => {
      const result = await token.balanceOf(accounts[0]);
      expect(result.toString()).to.equal(expectedResult.totalSupply.toString());
    });
  });

  describe('Transfer of Tokens', () => {
    const [sender, receiver] = accounts;
    const amountToSend = toBN(10);
    it('Should reflect the correct balances in the accounts', async () => {
      const senderStartingBalance = await token.balanceOf(sender);
      const receiverStartingBalance = await token.balanceOf(receiver);

      await token.transfer(receiver, amountToSend, { from: sender });

      const senderEndingBalance = await token.balanceOf(sender);
      const receiverEndingBalance = await token.balanceOf(receiver);

      expect(senderEndingBalance.toString()).to.equal(
        senderStartingBalance.sub(amountToSend).toString()
      );
      expect(receiverStartingBalance.add(amountToSend).toString()).to.equal(
        receiverEndingBalance.toString()
      );
    });
  });
});
