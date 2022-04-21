const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const compiledFactory = require('./build/DomainFactory.json')

const provider = new HDWalletProvider(
    'tooth fashion message install report agree rebuild video violin name section mom',
    'https://rinkeby.infura.io/v3/572a438bd1424f5f8f4ac368bce12cb1'
);
const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    console.log('Attempting to deploy from accout', accounts[0]);
    const interface = compiledFactory.abi;
    const bytecode = compiledFactory.evm.bytecode.object;

    const result = await new web3.eth.Contract(interface)
        .deploy({ data: bytecode, arguments: ["hkust"] })
        .send({ gas: '10000000', from: accounts[0] });
    console.log('Contract deployed to', result.options.address);
    provider.engine.stop();
};

deploy();
