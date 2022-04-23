const { Packet } = require('dns2');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const compiledFactory = require('../ethereum/build/DomainFactory.json')

const distribQuery = async (name) => {
    fqdn = name.split('.');
    tld = fqdn.pop();
    if (tld != 'hkust') {
        throw new Error("TLD is not hkust");
    }
    domainName = fqdn.pop();
    queryName = fqdn.join('.');

    const provider = new HDWalletProvider(
        'tooth fashion message install report agree rebuild video violin name section mom',
        'https://rinkeby.infura.io/v3/572a438bd1424f5f8f4ac368bce12cb1'
    );
    const web3 = new Web3(provider);

    const instance = new web3.eth.Contract(
        compiledFactory.abi,
        '0x2B896740E059cb88Ab4A6AFc68dd1B532BCf415F'
    );

    try {
        const answer = await instance.methods.query(queryName,domainName).call();
        const ipRegex = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)(\.(?!$)|$)){4}$/;
        if (ipRegex.test(answer)) {
            return {
                name,
                type: Packet.TYPE.A,
                class: Packet.CLASS.IN,
                ttl: 300,
                address: answer
            };
        } else {
            return {
                name,
                type: Packet.TYPE.CNAME,
                class: Packet.CLASS.IN,
                ttl: 300,
                domain: answer
            };
        }
    } catch (error) {
        return {
            name,
            type: Packet.TYPE.A,
            class: Packet.CLASS.IN,
            ttl: 300,
            address: ''
        }
    }

}


module.exports = distribQuery;