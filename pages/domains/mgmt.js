import React, { Component } from 'react';
import Layout from '../../components/Layout';
import Domain from '../../ethereum/domain';
import web3 from '../../ethereum/web3';
import { Button, Input, Message, Form } from 'semantic-ui-react';
import { Link } from '../../routes';

class DomainMgmt extends Component {
    state = {
        recordName: '',
        recordValue: '',
        setErrorMessage: '',
        setSuccessMessage: '',
        setLoading: false,
    };

    static async getInitialProps(props) {
        const { address } = props.query;
        const domain = Domain(address);
        const accounts = await web3.eth.getAccounts();
        const isOwner = await domain.methods.isOwner().call({
            from: accounts[0]
        });
        const domainName = await domain.methods.domain().call();
        const tld = await domain.methods.tld().call();
        const suffix = '.'.concat(domainName).concat('.').concat(tld);
        return { address, isOwner, suffix };
    }

    onSet = async (event) => {
        event.preventDefault();

        this.setState({
            setLoading: true,
            setErrorMessage: '', 
            setSuccessMessage: '',
        });

        try {
            const accounts = await web3.eth.getAccounts();
            const domain = Domain(this.props.address);
            await domain.methods
                .set(this.state.recordName, this.state.recordValue)
                .send({
                    from: accounts[0],
                    gas: '3000000'
                });
            this.setState({
                setSuccessMessage: 'Record is set!',
            });
        } catch (err) {
            this.setState({ setErrorMessage: "Failed to set record. Access denied" });
        }
        
        this.setState({ setLoading: false });
    };


    render () {
        return (
            <Layout>
                <Link route='/'>
                    <a>
                        <Button primary>Back</Button>
                    </a>
                </Link>
                <div style={{ marginTop: 10}}>
                    {(() => {
                        if (! this.props.isOwner) {
                            return (
                                <Message error header="Permission denied" content="You are not the domain owner" />
                            );
                        } else {
                            return (
                                <div>
                                    <h3>{this.props.suffix}</h3>
                                    <Form onSubmit={this.onSet} error={!!this.state.setErrorMessage} success={!!this.state.setSuccessMessage}>
                                        <Form.Field>
                                            <label>Set Record</label>
                                            <Input
                                                label={this.props.suffix}
                                                labelPosition='right'
                                                placeholder='recordName'
                                                value={this.state.recordName}
                                                onChange={event =>
                                                    this.setState({ recordName: event.target.value })}
                                            />
                                            <Input
                                                placeholder='recordValue'
                                                value={this.state.recordValue}
                                                onChange={event =>
                                                    this.setState({ recordValue: event.target.value })}
                                            />
                                        </Form.Field>
                                                
                                        <Message error header="Oops!" content={this.state.setErrorMessage} />
                                        <Message success header="Success" content={this.state.setSuccessMessage} />
                                        <Button loading={this.state.setLoading} primary>Submit</Button>
                                    </Form>

                                </div>
                            );
                        }
                    })()} 
                </div>
            </Layout>
        );
    }
}

export default DomainMgmt;