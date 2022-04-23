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
        .deploy({ data: compiledFactory.evm.bytecode.object, arguments: ["hkust"]})
        .send({ from: accounts[0], gas: '30000000'});

    await factory.methods.register("cse").send({
        from: accounts[0],
        gas: '30000000',
        value: web3.utils.toWei(1, 'ether')
    })

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
});
