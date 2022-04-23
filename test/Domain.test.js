const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/DomainFactory.json');
const compiledDomain = require('../ethereum/build/Domain.json');
const { beforeEach, it } = require('mocha');

let accounts;
let factory;
let domainAddress;
let domain;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    factory = await new web3.eth.Contract(compiledFactory.abi)
        .deploy({ data: compiledFactory.evm.bytecode.object, arguments: ["hkust"] })
        .send({ from: accounts[0], gas: '3000000' });

    await factory.methods.register("cse").send({
        from: accounts[1],
        gas: '3000000',
        value: web3.utils.toWei('1', 'ether')
    });

    domainAddress = await factory.methods.getDomainAddress("cse").call();
    domain = await new web3.eth.Contract(
        compiledDomain.abi,
        domainAddress
    );
});

describe('Domain', () => {
    it('deploys a factory and a domain', () => {
        assert.ok(factory.options.address);
        assert.ok(domain.options.address);
    });

    it('checks ownership of deployed factory and domain', async () => {
        assert.equal(await factory.methods.owner().call(), accounts[0]);
        assert.equal(await domain.methods.owner().call(), accounts[1]);
        await factory.methods.transferOwnership(accounts[1]).send({
            from: accounts[0],
            gas: '3000000'
        });
        await domain.methods.transferOwnership(accounts[0]).send({
            from: accounts[1],
            gas: '3000000'
        });
        assert.equal(await factory.methods.owner().call(), accounts[1]);
        assert.equal(await domain.methods.owner().call(), accounts[0]);
    });

    it('checks domain name and tld name', async() => {
        assert.equal(await domain.methods.domain().call(), "cse");
        assert.equal(await domain.methods.tld().call(), "hkust");
    });

    it('allows set/reset/query domain records', async () => {
        try {
            await domain.methods.query("www").call();
            assert(false);
        } catch (err) {
            assert(err);
        }
        try {
            await domain.methods.reset("www").call();
            assert(false);
        } catch (err) {
            assert(err);
        }
        try {
            await domain.methods.set("www", "192.168.0.1").send({
                from: accounts[0],
                gas: '3000000'
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
        await domain.methods.set("www", "192.168.0.1").send({
            from: accounts[1],
            gas: '3000000'
        });
        assert.equal(await domain.methods.query("www").call(), "192.168.0.1");
        try {
            await domain.methods.reset("www").send({
                from: accounts[0],
                gas: '3000000'
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
        await domain.methods.reset("www").send({
            from: accounts[1],
            gas: '3000000'
        });
        try {
            await domain.methods.query("www").call();
            assert(false);
        } catch (err) {
            assert(err)
        }
    });

    it('checks factory tld name', async () => {
        assert.equal(await factory.methods.topLevel().call(), "hkust");
    });

    it('checks factory domain address getter', async () => {
        assert.equal(await factory.methods.getDomainAddress("cse").call(), domain.options.address);
    });

    it('checks factory query', async () => {
        await domain.methods.set("www", "192.168.0.1").send({
            from: accounts[1],
            gas: '3000000'
        });
        assert.equal(await domain.methods.query("www").call(), "192.168.0.1");
        assert.equal(await factory.methods.query("www", "cse").call(), "192.168.0.1");
    });

    it('checks expiration and extension', async () => {
        const expires = await factory.methods.getDomainExpiration("cse").call();

        assert(parseInt(expires) >= Math.floor(Date.now() / 1000) + 31536000 - 5);
        await factory.methods.extend("cse").send({
            from: accounts[1],
            gas: '3000000',
            value: web3.utils.toWei('1', 'ether')
        }); 
        const newExpires = await factory.methods.getDomainExpiration("cse").call();
        assert(parseInt(newExpires) >= Math.floor(Date.now() / 1000) + 2 * 31536000 - 5);
    });
});
