import web3 from './web3';
import DomainFactory from './build/DomainFactory.json';

const instance = new web3.eth.Contract(
    DomainFactory.abi,
    '0x2B896740E059cb88Ab4A6AFc68dd1B532BCf415F'
);

export default instance;