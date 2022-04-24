import React, { Component } from 'react';
import Layout from '../../components/Layout';
import Domain from '../../ethereum/domain';
import web3 from '../../ethereum/web3';
import { Button, Message } from 'semantic-ui-react';
import { Link } from '../../routes';

class DomainMgmt extends Component {
    static async getInitialProps(props) {
        const { address } = props.query;
        const domain = Domain(address);
        const accounts = await web3.eth.getAccounts();
        const isOwner = await domain.methods.isOwner().call({
            from: accounts[0]
        });
        return { address, isOwner };
    }

    render () {
        return (
            <Layout>
                <Link route='/'>
                    <a>
                        <Button primary>Back</Button>
                    </a>
                </Link>
                <div>
                    {(() => {
                        if (! this.props.isOwner) {
                            return (
                                <Message error header="Permission denied" content="You are not the domain owner" />
                            );
                        } else {
                            return (
                                <Message success header="Permission allowed" content="You are the domain owner" />
                            )
                        }
                    })()} 
                </div>
            </Layout>
        );
    }
}

export default DomainMgmt;