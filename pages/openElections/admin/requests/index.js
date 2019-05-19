import React, { Component } from 'react';
import Layout from '../../../../components/Layout.js';
import { Button, Table } from 'semantic-ui-react';
import OpenElection from '../../../../ethereum/openelection';
import RequestRow from '../../../../components/RequestRow';
import { Link, Router } from '../../../../routes';
import web3 from '../../../../ethereum/web3';

class RequestIndex extends Component {
  static async getInitialProps(props) {
    const { address } = props.query;

    const openElection = OpenElection(address);
    const requestCount = await openElection.methods.getRequestsCount().call();

    const requests = await Promise.all(
      Array(parseInt(requestCount)).fill().map((element, index) => {
        return openElection.methods.requests(index).call()
      })
    );

    return { address, requests, requestCount };
  }

  renderRows() {
    return this.props.requests.map((request, index) => {
      return (
        <RequestRow
          key={index}
          id={index}
          request={request}
          address={this.props.address}
        />
      );
    });
  }

	onWeb3ProviderChange = event => {
		var account = web3.currentProvider.selectedAddress;
		setInterval(function () {
			if (web3.currentProvider.selectedAddress !== account) {
				account = web3.currentProvider.selectedAddress;
				Router.pushRoute(`/`);
			}
		}, 100);
	};

  render() {
    const { Header, Row, HeaderCell, Body } = Table;

    return (
      <Layout>
				{this.onWeb3ProviderChange()}

        <Link route={`/openElections/${this.props.address}/admin`}>
          <a><Button primary circular content='Voltar' icon='arrow left' labelPosition='left' /></a>
        </Link>

        <h3>Solicitações</h3>

        <Table>

          <Header>
            <Row>
              <HeaderCell>ID</HeaderCell>
              <HeaderCell>Endereço</HeaderCell>
              <HeaderCell>Aprovar</HeaderCell>
              <HeaderCell>Recusar</HeaderCell>
            </Row>
          </Header>

          <Body>
            {this.renderRows()}
          </Body>

        </Table>

        <div>Foram encontradas {this.props.requestCount} solicitações.</div>

      </Layout>
    );
  }
}

export default RequestIndex;
