import React, { Component } from 'react';
import Layout from '../../components/Layout.js';
import { Link } from '../../routes';
import { Button, Header, Icon, Table, Label } from 'semantic-ui-react';
import OpenElection from '../../ethereum/openelection';
import _ from 'lodash';

class OpenElectionFinalResult extends Component {

  static async getInitialProps(props) {
    const { address } = props.query;

    const openElection = OpenElection(address);
    const candidatesCount = await openElection.methods.getNumOfCandidates().call();
    const openElectionName = await openElection.methods.electionName().call();

    const candidates = await Promise.all(
      Array(parseInt(candidatesCount)).fill().map((element, index) => {
        return openElection.methods.candidatesArray(index).call()
      })
    );

    return { candidates, address, candidatesCount, openElectionName: openElectionName.toString() };
  }

  renderRows() {
    return this.props.candidates.map((candidate, index) => {
      const { Row, Cell } = Table;

      if (!index) {
        return (
          <Row>
            <Cell><Label ribbon>{index + 1}</Label></Cell>
            <Cell>{candidate.where}</Cell>
            <Cell>{candidate.completeName}</Cell>
            <Cell>{candidate.cpf}</Cell>
            <Cell>{candidate.numVotes}</Cell>
          </Row>
        );

      } else {
        return (
          <Row>
            <Cell>{index + 1}</Cell>
            <Cell>{candidate.where}</Cell>
            <Cell>{candidate.completeName}</Cell>
            <Cell>{candidate.cpf}</Cell>
            <Cell>{candidate.numVotes}</Cell>
          </Row>
        );
      }

    });
  }

  state = {
    column: null,
    data: this.props.candidates,
    direction: null,
  }

  handleSort = clickedColumn => () => {
    const { column, data, direction } = this.state

    if (column !== clickedColumn) {
      this.setState({
        column: clickedColumn,
        data: _.sortBy(data, [clickedColumn]),
        direction: 'ascending',
      })

      return
    }

    this.setState({
      data: data.reverse(),
      direction: direction === 'ascending' ? 'descending' : 'ascending',
    })
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
    const { Row, HeaderCell, Body, Cell } = Table
    const { column, data, direction } = this.state

    return (
      <Layout>
        {this.onWeb3ProviderChange()}

        <Link route={`/openElections/${this.props.address}`}>
          <a>
            <Button primary circular content='Voltar' icon='arrow left' labelPosition='left' />
          </a>
        </Link>

        <Header as='h2' icon textAlign='center'>
          <Icon name='chess king' circular />
          <Header.Content>Resultado Final - {this.props.openElectionName}</Header.Content>
        </Header>

        <Table sortable>
          <Table.Header>
            <Row>

              <HeaderCell>Endereço</HeaderCell>

              <HeaderCell
                sorted={column === 'completeName' ? direction : null}
                onClick={this.handleSort('completeName')}>
                Nome
              </HeaderCell>

              <HeaderCell>CPF</HeaderCell>

              <HeaderCell
                sorted={column === 'numVotes' ? direction : 'descending'}
                onClick={this.handleSort('numVotes')}>
                Votos
              </HeaderCell>

            </Row>
          </Table.Header>

          <Body>
            {_.map(data, ({ where, completeName, cpf, numVotes }) => (
              <Row>
                <Cell>{where}</Cell>
                <Cell>{completeName}</Cell>
                <Cell>{cpf}</Cell>
                <Cell>{numVotes}</Cell>
              </Row>
            ))}
          </Body>
        </Table>

        <div>Foram encontrados {this.props.candidatesCount} candidados.</div>

      </Layout>
    );
  }
}

export default OpenElectionFinalResult;
