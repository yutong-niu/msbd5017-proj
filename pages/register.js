import React, { Component } from 'react';
import { Form, Button, Input, Message } from 'semantic-ui-react';
import Layout from '../components/Layout';
import factory from '../ethereum/factory';
import web3 from '../ethereum/web3';
import { Router } from '../routes';

class DomainNew extends Component {
    state = {
        domainName: '',
        errorMessage: '',
        loading: false
    };

    onSubmit = async (event) => {
        event.preventDefault();

        this.setState({ loading: true, errorMessage: '' });

        try {
            const accounts = await web3.eth.getAccounts();
            await factory.methods
                .register(this.state.domainName)
                .send({
                    from: accounts[0],
                    value: web3.utils.toWei("1", "ether")
                });
            const domainAddress = await factory.methods
                .getDomainAddress(this.state.domainName)
                .call();
            Router.pushRoute('/domains/' + domainAddress);
        } catch (err) {
            this.setState({ errorMessage: "Domain is not available." });
        }
        
        this.setState({ loading: false });
    };

    render() {
        return (
            <Layout>
                <h1>Register a Domain</h1>

                <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
                    <Form.Field>
                        <label>Domain Name</label>
                        <Input
                            label=".hkust"
                            labelPosition='right'
                            value={this.state.domainName}
                            onChange={event =>
                                this.setState({ domainName: event.target.value })}
                        />
                    </Form.Field>

                    <Message error header="Oops!" content={this.state.errorMessage} />
                    <Button loading={this.state.loading} primary>Submit</Button>
                </Form>
            </Layout>
        );
    }
}

export default DomainNew;