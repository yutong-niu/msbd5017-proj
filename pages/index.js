import React, { Component } from 'react';
import { Form, Button, Input, Message, Divider } from 'semantic-ui-react';
import factory from '../ethereum/factory';
import 'semantic-ui-css/semantic.min.css';
import Layout from '../components/Layout';
import { Link } from '../routes';
import { Router } from '../routes';

class DomainIndex extends Component {
    state = {
        domainName: '',
        queryName: '',
        queryMessage: '',
        domainErrorMessage: '',
        queryErrorMessage: '',
        domainLoading: false,
        queryLoading: false
    };

    onMgmtSubmit = async (event) => {
        event.preventDefault();

        this.setState({
            domainLoading: true,
            queryLoading: false,
            queryMessage: '',
            domainErrorMessage: '',
            queryErrorMessage: '', 
        });

        try {
            const domainAddress = await factory.methods
                .getDomainAddress(this.state.domainName)
                .call();
            Router.pushRoute('/domains/' + domainAddress);
        } catch (err) {
            this.setState({ domainErrorMessage: "Domain is not registered." });
        }
        
        this.setState({ domainLoading: false });
    };

    onQuerySubmit = async (event) => {
        event.preventDefault();

        this.setState({
            domainLoading: false,
            queryLoading: true,
            queryMessage: '',
            domainErrorMessage: '',
            queryErrorMessage: '', 
        });

        try {
            var fullQuery = this.state.queryName.split('.');
            const domainName = fullQuery.pop();
            const queryName = fullQuery.join('.');
            const response = await factory.methods
                .query(queryName, domainName)
                .call();
            this.setState({queryMessage: response});
        } catch (err) {
            this.setState({ queryErrorMessage: "Unkown Host." });
        }
        
        this.setState({ queryLoading: false });
    };

    render() {
        return (
            <Layout>
                <div>
                    <Link route="/register">
                        <a>
                            <Button 
                                floated="right"
                                content="Register Domain"
                                icon="add circle"
                                primary
                            />
                        </a>
                    </Link>

                    <Form onSubmit={this.onMgmtSubmit} error={!!this.state.domainErrorMessage}>
                        <Form.Field>
                            <label>Manage Domain</label>
                            <Input
                                label=".hkust"
                                labelPosition='right'
                                value={this.state.domainName}
                                onChange={event =>
                                    this.setState({ domainName: event.target.value })}
                            />
                        </Form.Field>

                        <Message error header="Oops!" content={this.state.domainErrorMessage} />
                        <Button loading={this.state.domainLoading} primary>Submit</Button>
                    </Form>

                    <Divider horizontal>Or</Divider>

                    <Form onSubmit={this.onQuerySubmit} error={!!this.state.queryErrorMessage} success={!!this.state.queryMessage}>
                        <Form.Field>
                            <label>Query</label>
                            <Input
                                label=".hkust"
                                labelPosition='right'
                                value={this.state.queryName}
                                onChange={event =>
                                    this.setState({ queryName: event.target.value })}
                            />
                        </Form.Field>

                        <Message error header="Oops!" content={this.state.queryErrorMessage} />
                        <Message success header="Result" content={this.state.queryMessage} />
                        <Button loading={this.state.queryLoading} primary>Submit</Button>
                    </Form>

                </div>
            </Layout>
        );
    }
}

export default DomainIndex;