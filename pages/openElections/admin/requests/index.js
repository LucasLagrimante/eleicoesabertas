import React, { Component } from 'react';
import Layout from '../../../../components/Layout.js';
import { Link } from '../../../../routes';
import { Form, Button, Icon, Input, Message, Table } from 'semantic-ui-react';
import OpenElection from '../../../../ethereum/openelection';
import RequestRow from 'ethereum\components\RequestRow.js';

class RequestIndex extends Component {
  static async getInitialProps(props) {
    const { address } = props.query;

    const openElection = OpenElection(address);
    const requestCount = await openElection.methods.getRequestsCount().call();
    const approversCount = await openElection.methods.approversCount().call();

    const requests = await Promise.all(
      Array(parseInt(requestCount)).fill().map((element, index) => {
        return openElection.methods.requests(index).call()
      })
    );

    return { address, requests, requestCount, approversCount };
  }

  renderRows() {
    return this.props.requests.map((request, index) => {
      return (
        <RequestRow
        key={index}
        id={index}
        request={request}
        address={this.props.address}
        approversCount={this.props.approversCount}
        />
      );
    });
  }

  render() {
    const { Header, Row, HeaderCell, Body } = Table;

    return(
      <Layout>
        <Link route={`/openElections/${this.props.address}`}>
          <a><Button primary circular content='Back' icon='arrow left' labelPosition='left' /></a>
        </Link>
        <h3>Requests</h3>
        <Link route={`/openElections/${this.props.address}/requests/new`}>
          <a><Button primary floated="right" style={{ marginBottom:10 }}> Add Request </Button></a>
        </Link>
        <Table>
          <Header>
            <Row>
              <HeaderCell>ID</HeaderCell>
              <HeaderCell>Description</HeaderCell>
              <HeaderCell>Amount</HeaderCell>
              <HeaderCell>Recipient</HeaderCell>
              <HeaderCell>Approval Count</HeaderCell>
              <HeaderCell>Approve</HeaderCell>
              <HeaderCell>Finalize</HeaderCell>
            </Row>
          </Header>

          <Body>
            {this.renderRows()}
          </Body>
        </Table>
        <div>Found {this.props.requestCount} requests.</div>
      </Layout>
    );
  }
}

export default RequestIndex;
