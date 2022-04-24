import React, { Component } from 'react';
import Layout from '../../components/Layout';
import Domain from '../../ethereum/domain';
import web3 from '../../ethereum/web3';
import { Button, Input, Message, Form, Divider } from 'semantic-ui-react';
import { Link } from '../../routes';

class DomainMgmt extends Component {
    state = {
        setRecordName: '',
        setRecordValue: '',
        setErrorMessage: '',
        setSuccessMessage: '',
        setLoading: false,
        resetRecordName: '',
        resetErrorMessage: '',
        resetSuccessMessage: '',
        resetLoading: false,
        queryRecordName: '',
        queryErrorMessage: '',
        querySuccessMessage: '',
        queryLoading: false,
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
            resetLoading:false,
            queryLoading: false,
            setErrorMessage: '', 
            setSuccessMessage: '',
            resetErrorMessage: '', 
            resetSuccessMessage: '',
            queryErrorMessage: '',
            querySuccessMessage: '',
            resetRecordName: '',
            queryRecordName: '',
        });

        try {
            const accounts = await web3.eth.getAccounts();
            const domain = Domain(this.props.address);
            await domain.methods
                .set(this.state.setRecordName, this.state.setRecordValue)
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

    onReset = async (event) => {
        event.preventDefault();

        this.setState({
            resetLoading: true,
            setLoading: false,
            queryLoading: false,
            setErrorMessage: '', 
            setSuccessMessage: '',
            resetErrorMessage: '', 
            resetSuccessMessage: '',
            queryErrorMessage: '',
            querySuccessMessage: '',
            setRecordName: '',
            setRecordValue: '',
            queryRecordName: '',
        });

        try {
            const accounts = await web3.eth.getAccounts();
            const domain = Domain(this.props.address);
            await domain.methods
                .reset(this.state.resetRecordName)
                .send({
                    from: accounts[0],
                    gas: '3000000'
                });
            this.setState({
                resetSuccessMessage: 'Record is reset!',
            });
        } catch (err) {
            this.setState({ resetErrorMessage: "Failed to reset record. Access denied" });
        }
        
        this.setState({ resetLoading: false });
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
                                                value={this.state.setRecordName}
                                                onChange={event =>
                                                    this.setState({ setRecordName: event.target.value })}
                                            />
                                            <Input
                                                placeholder='recordValue'
                                                value={this.state.setRecordValue}
                                                onChange={event =>
                                                    this.setState({ setRecordValue: event.target.value })}
                                            />
                                        </Form.Field>
                                                
                                        <Message error header="Oops!" content={this.state.setErrorMessage} />
                                        <Message success header="Success" content={this.state.setSuccessMessage} />
                                        <Button loading={this.state.setLoading} primary>Submit</Button>
                                    </Form>

                                    <Divider horizontal>Or</Divider>

                                    <Form onSubmit={this.onReset} error={!!this.state.resetErrorMessage} success={!!this.state.resetSuccessMessage}>
                                        <Form.Field>
                                            <label>Reset Record</label>
                                            <Input
                                                label={this.props.suffix}
                                                labelPosition='right'
                                                placeholder='recordName'
                                                value={this.state.resetRecordName}
                                                onChange={event =>
                                                    this.setState({ resetRecordName: event.target.value })}
                                            />
                                        </Form.Field>
                                                
                                        <Message error header="Oops!" content={this.state.resetErrorMessage} />
                                        <Message success header="Success" content={this.state.resetSuccessMessage} />
                                        <Button loading={this.state.resetLoading} primary>Submit</Button>
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