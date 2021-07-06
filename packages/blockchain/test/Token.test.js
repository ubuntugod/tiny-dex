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

  describe('TinyDEX Contract', () => {
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

  describe('transfer', () => {
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

    describe('Success', () => {
      let tx, txLogs;
      beforeEach(async () => {
        tx = await token.transfer(receiver, amountToSend, {
          from: sender,
        });
        txLogs = tx?.logs;
      });

      it('Should trigger a transfer event once transfer is done', async () => {
        const result = txLogs[txLogs.length - 1]?.event;
        expect(result).to.equal('Transfer');
      });

      it('Should transfer from the actual sender to desired receiver only', () => {
        const { 0: from, 1: to } = txLogs[txLogs.length - 1]?.args;
        expect(from).to.equal(sender);
        expect(to).to.equal(receiver);
      });
    });

    describe('Fail', () => {
      const [, sender, receiver] = accounts;

      it('Should not allow the transfer if there is insufficient fund', async () => {
        const amountToSend = toBN(100);
        const tx = token.transfer(receiver, amountToSend, {
          from: sender,
        });
        await expect(tx).to.be.rejectedWith('Insufficient balance available');
      });

      it('Should not allow transfer to invalid address', async () => {
        const tx = token.transfer(0x0, amountToSend, {
          from: sender,
        });
        await expect(tx).to.be.rejected;
      });
    });
  });

  describe('approve', () => {
    const [sender, , spender] = accounts;
    let amount;

    describe('Success', () => {
      let tx;
      beforeEach(async () => {
        amount = toBN(100);
        tx = await token.approve(spender, amount, { from: sender });
      });

      it('Should allow the owner to specify the allowance of the spender', async () => {
        const remainingAllowance = await token.allowance(sender, spender);
        expect(remainingAllowance.toString()).to.equal(amount.toString());
      });

      it('Should emit an `Approval` event', () => {
        const logs = tx?.logs;
        const result = logs[0].event;
        expect(result).to.equal('Approval');
      });

      it('Should only approve the correct amount specified', () => {
        const logs = tx?.logs;
        const { 2: amountAllowed } = logs[0].args;
        expect(amountAllowed.toString()).to.equal(amount.toString());
      });
    });

    describe('Fail', () => {
      it('Should throw error when the spender is invalid', async () => {
        const tx = token.approve(0x0, amount, { from: sender });
        await expect(tx).to.be.rejected;
      });
    });
  });

  describe('transferFrom', async () => {
    const [sender, receiver, spender] = accounts;
    let amount;

    beforeEach(async () => {
      amount = toBN(100);
      await token.approve(spender, amount, { from: sender });
    });

    describe('Success', () => {
      let tx, logs, senderInitialBalance, receiverInitialBalance;

      beforeEach(async () => {
        senderInitialBalance = await token.balanceOf(sender);
        receiverInitialBalance = await token.balanceOf(receiver);
        tx = await token.transferFrom(sender, receiver, amount, {
          from: spender,
        });
        logs = tx.logs;
      });

      it('Should transfer the tokens from `sender` to `receiver`', async () => {
        const senderBalance = await token.balanceOf(sender);
        const receiverBalance = await token.balanceOf(receiver);
        expect(senderBalance.toString()).to.equal(
          senderInitialBalance.sub(amount).toString()
        );
        expect(receiverBalance.toString()).to.equal(
          receiverInitialBalance.add(amount).toString()
        );
      });

      it('Should trigger a transfer event once transfer is done', async () => {
        const result = logs[0]?.event;
        expect(result).to.equal('Transfer');
      });

      it('Should transfer correct amount from the sender to receiver', () => {
        const { 0: from, 1: to, 2: value } = logs[0]?.args;
        expect(from).to.equal(sender);
        expect(to).to.equal(receiver);
        expect(value.toString()).to.equal(amount.toString());
      });

      it('Should reset the `allowance`', async () => {
        const remainingAllowance = await token.allowance(sender, spender);
        expect(remainingAllowance.toString()).to.equal('0');
      });
    });

    describe('Fail', () => {
      it('Should not allow transfer to invalid address', async () => {
        const tx = token.transferFrom(sender, 0x0, amount, {
          from: spender,
        });
        await expect(tx).to.be.rejected;
      });

      it('Should not allow the transfer if there is insufficient funds', async () => {
        const amountToSend = toBN(21_000_000_0);
        const tx = token.transferFrom(sender, receiver, amountToSend, {
          from: spender,
        });
        await expect(tx).to.be.rejected;
      });
    });
  });
});
