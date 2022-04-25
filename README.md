# MSBD5017 Project - DDNS

DDNS stands for distributed DNS, is a dApp on top of Ethereum network to provide DNS service. Smart contracts are built and deployed to provide the storage of DNS records and interface to update/query them. For testing purpose, the smart contracts are deployed to Rinkeby test network. To make the smart contract compatible with the current DNS standard, a resolver is implemented as the authoritative DNS server for the DDNS domains. Also a web front end application is built to allow domain owners to update and everyone to query the distributed DNS records. 

1. [Smart Contract](#smart-contract)
2. [Unit Testing](#unit-testing)
3. [Resolver](#resolver)
4. [Front End](#front-end)

## Project Setup
Requirement: nodejs:16
```shell
git clone https://github.com/yutong-niu/msbd5017-proj.git
cd msbd5017-proj
npm install
```

## Smart Contract <a name="smart-contract"></a>
Contracts are under `./ethereum/contracts`.   
Three contracts in total:
- Ownable: Contract for ownership management (./ethereum/contracts/common/Ownable.sol)
- Domain: Contract for secondary level domain (./ethereum/contracts/Domain.sol)
- DomainFactory: Contract for top level domain (./ethereum/contracts/DomainFactory.sol)  

**Domain** and **DomainFactory** inherit **Ownable**.

### Build script

To build the contracts, run the compile script **compile.js**

```shell
cd ./ethereum
node compile.js
```
The script will rebuild the build directory `./ethereum/build/`, compiled all three contracts and create three json files.
- Domain.json
- DomainFactory.json
- Ownable.json

These compiled json files include the ABI and bytecode for the smart contracts.

### Deploy script

To deploy the contracts, the build script must be run first. Check the directory `./ethereum/build/` before running the deploy script **deploy.js**

```shell
cd ./ethereum
node deploy.js
```
The script will deploy one instance of **DomainFactory** contract to the Rinkeby test network.  
Reminded that **DomainFactory** contract creates a Top Level Domain (TLD).  
In this project, a TLD `.hkust` is deployed.  
And the deployed contract has the address `0x2B896740E059cb88Ab4A6AFc68dd1B532BCf415F` on Rinkeby test network.  
The address is written to a file **ADDRESS** at `./ADDRESS`. 

> Contract **Domain** need not be deployed. Secondary domain can be created by **register** method of **DomainFactory** (TLD)

## Unit Testing <a name="unit-testing"></a>

The unit testing for the smart contract uses test framework mocha. To run the unit tests, first change directory to the project home and run

```shell
npm run test
```
8 test cases will be run.
The test cases are defined in `./test/Domain.test.js`.

## Resolver <a name="resolver"></a>

A dns resolver is implemented as the authoritative DNS server for the deployed `.hkust` TLD. It is compatible with the DNS protocol, which uses UDP port 53 for DNS query. If the DNS question is not with `.hkust` TLD, the resolver will make query to public DNS servers and return the response on behalf.

Code related with the resolver is under `./resolver/`

The resolver can be built and deployed with Docker, Dockerfile path is `./resolver/Dockerfile`.

To build the resolver, first change directory to the project home and run:

```shell
docker build -t ddns-resolver -f ./resolver/Dockerfile .
```

To run the built resolver:

```shell
docker run -d -p 53:53/udp ddns-resolver
```

The Docker image has been deployed to a public AWS ECR repository: [public.ecr.aws/n0x2w4q4/ddns-resolver](public.ecr.aws/n0x2w4q4/ddns-resolver).

## Front End <a name="front-end"></a>

A front end web application is built for domain register, DNS records query/update. The web app uses the NextJS framework and can also be deployed as the Docker container, Dockerfile path is under the project home `./Dockerfile`.

To build the front end web application, first change directory to the project home and run:

```shell
docker build -t ddns-frontend .
```

To run the front end web app:

```shell
docker run -d -p 80:3000 ddns-frontend
```

Then the web application can be accessed through http://localhost.

The Docker image has been deployed to a public AWS ECR repository: [public.ecr.aws/n0x2w4q4/ddns-frontend](public.ecr.aws/n0x2w4q4/ddns-frontend).
