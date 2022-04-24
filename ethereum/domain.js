import web3 from './web3';
import Domain from './build/Domain.json';

export default (address) => {
    return new web3.eth.Contract(
        Domain.abi,
        address
    );
}