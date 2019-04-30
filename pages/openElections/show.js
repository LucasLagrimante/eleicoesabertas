import React, { Component } from 'react';
import Layout from '../../components/Layout';
import OpenElection from '../../ethereum/openelection';
import { Card, Grid, Button } from 'semantic-ui-react';
import web3 from '../../ethereum/web3';
//import ContributeForm from '../../components/ContributeForm';
import { Link } from '../../routes';

class OpenElectionShow extends Component {
    static async getInitialProps(props) {
      const openElection = OpenElection(props.query.address);
      const summary = await openElection.methods.getSummary().call();

      return {
        address: props.query.address,
        manager: summary[0],
        winner: summary[1],
        maxVoters: summary[2],
        maxCandidates: summary[3],
        totalVotes: summary[4],
        onlyAuthenticated: summary[5].toString(),
        isEnded: summary[6].toString(),
        isStarted: summary[7].toString(),
        openElectionName: summary[8].toString()
      };
    }

    renderCards() {
        const {
          address,
          manager,
          winner,
          maxVoters,
          maxCandidates,
          totalVotes,
          onlyAuthenticated,
          isEnded,
          isStarted,
          openElectionName
        } = this.props;

        const items = [
          {
            header: manager,
            meta: 'Endereço do Administrador',
            description: 'O admnistrador criou essa eleição e pode inicia-la e termina-la.',
            style: { overflowWrap: 'break-word' }
          },
          {
            header: winner,
            meta: 'Vencedor',
            description: 'Vencedor Único.',
            style: { overflowWrap: 'break-word' }
          },
          {
            header: maxVoters,
            meta: 'Número máximo de votos',
            description: 'Número máximo de votos possíveis, definidos na criação da eleição.'
          },
          {
            header: maxCandidates,
            meta: 'Número máximo de candidatos',
            description: 'Número máximo de candidatos possíveis, definidos na criação da eleição.'
          },
          {
            header: totalVotes,
            meta: 'Votos Computados',
            description: 'Número de votos válidos.'
          },
          {
            header: onlyAuthenticated,
            meta: 'Apenas usuários Autenticados',
            description: 'Essa flag garante que apenas usuários autenticados poderão votar.'
          },
          {
            header: isEnded,
            meta: 'Terminou?',
            description: 'Essa flag nos diz se a votação está terminada.'
          },
          {
            header: isStarted,
            meta: 'Começou?',
            description: 'Essa flag nos diz se já podemos votar nessa eleição.'
          }
        ];

        return <Card.Group items={items} />;
    }

    render() {
    return (
      <Layout>
      <Link route={`/`}>
        <a><Button primary circular content='Voltar' icon='arrow left' labelPosition='left' /></a>
      </Link>
       <h3>Detalhes da Eleição - {this.props.openElectionName}</h3>
       <Grid>
        <Grid.Row>
          <Grid.Column width={10}>
            {this.renderCards()}
          </Grid.Column>
          <Grid.Column width={6}>

          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Link route={`/openElections/${this.props.address}/voting`}>
              <a><Button primary> Votar!! </Button></a>
            </Link>
          </Grid.Column>
        </Grid.Row>
       </Grid>
      </Layout>
    );
  }
}

export default OpenElectionShow;
