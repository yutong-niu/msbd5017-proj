import React, { Component } from 'react';
import Layout from '../../components/Layout';
import Domain from '../../ethereum/domain';
import { Button, Message } from 'semantic-ui-react';
import { Link } from '../../routes';

class DomainMgmt extends Component {
    static async getInitialProps(props) {
        const { address } = props.query;
//        const domain = Domain(address);
//        const isOwner = domain.methods.isOwner().call();
//        return { address, isOwner};
        return { address };
    }

//    renderDomain () {
//        return (<h1>{this.props.address}</h1>);
//        if (! this.props.isOwner) {
//            return (
//                <Message
//                    error
//                    header="Permission denied"
//                    content="You are not the domain owner"
//                />
//            );
//        } else {
//            return (
//                <Message
//                    success
//                    header="you are the owner"
//                    content="you are the owner"
//                />
//            );
//        }
//    }

    render () {
        return (
//            <Layout>
//                <Link route='/'>
//                    <a>
//                        <Button primary>Back</Button>
//                    </a>
//                </Link>
                <h1>{this.props.address}</h1>
//            </Layout>
        );
    }
}

export default DomainMgmt;