import React, { Component } from 'react';
import Layout from '../../../components/Layout';
import OpenElection from '../../../ethereum/openelection';
import { Card, Grid, Button, Menu, Confirm, Header, Icon, Message } from 'semantic-ui-react';
import web3 from '../../../ethereum/web3';
import { Link, Router } from '../../../routes';

class OpenElectionAdmin extends Component {
    static async getInitialProps(props) {
      const openElection = OpenElection(props.query.address);
      const summary = await openElection.methods.getSummary().call();
      const numVoters = parseInt(await openElection.methods.getNumOfVoters().call());
      const numCandidates = parseInt(await openElection.methods.getNumOfCandidates().call());
      const [account] = await web3.eth.getAccounts();
      const isManager =  account == summary[0] ? true : false;

      return {
        address: props.query.address,
        isManager: isManager,
        numVoters: numVoters,
        numCandidates: numCandidates,
        maxVoters: summary[2],
        maxCandidates: summary[3],
        totalVotes: summary[4],
        onlyAuthenticated: summary[5].toString(),
        isEnded: summary[6].toString(),
        isStarted: summary[7].toString(),
        openElectionName: summary[8].toString()
      };
    }

    state = {
      startElectionMessageOpen: false,
      endElectionMessageOpen: false,
      loadingStartElection: false,
      loadingEndElection: false,
      disabledStartElection: false,
      disabledEndElection: false,
      errorMessage: ''
    };

    renderCards() {
        const {
          address,
          maxVoters,
          maxCandidates,
          numVoters,
          numCandidates,
          totalVotes,
          onlyAuthenticated,
          isEnded,
          isStarted,
          openElectionName
        } = this.props;

        const items = [
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
            header: numVoters,
            meta: 'Número de eleitores cadastrados',
            description: 'Número de eleitores cadastrados na eleição da eleição.'
          },
          {
            header: numCandidates,
            meta: 'Número de candidatos cadastrados',
            description: 'Número de candidatos cadastrados na eleição da eleição.'
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

    startOpenElection = async event => {
      event.preventDefault();
      this.setState({ loadingStartElection: true, disabledStartElection: true, startElectionMessageOpen: false });

      try {
        const [account] = await web3.eth.getAccounts();
        const openElection = OpenElection(this.props.address);
        await openElection.methods.startOpenElection()
        .send({
          from: account
        });

        setTimeout(() => {
          Router.pushRoute(`/openElections/${this.props.address}`);
        }, 3000);

      } catch (e) {
        if (e.message == 'No "from" address specified in neither the given options, nor the default options.') {
          this.setState({ errorMessage: "Há algum problema com nossa conexão com o MetaMask, verifique se o modo privado está ativo!" })
        } else {
          this.setState({ errorMessage: e.message })
        }
      }

      this.setState({ loadingStartElection: false, disabledStartElection: false});
    };

    endOpenElection = async event => {
      event.preventDefault();

      this.setState({ loadingEndElection: true, disabledEndElection: true, endElectionMessageOpen: false });

      try {
        const [account] = await web3.eth.getAccounts();
        const openElection = OpenElection(this.props.address);
        await openElection.methods.forceEndOpenElection()
        .send({
          from: account
        });

        setTimeout(() => {
          Router.pushRoute(`/openElections/${this.props.address}`);
        }, 3000);
      } catch (e) {
        if (e.message == 'No "from" address specified in neither the given options, nor the default options.') {
          this.setState({ errorMessage: "Há algum problema com nossa conexão com o MetaMask, verifique se o modo privado está ativo!" })
        } else {
          this.setState({ errorMessage: e.message })
        }
      }

      this.setState({ loadingEndElection: false, disabledEndElection: false});
    };

    render() {
    return (
      <Layout>

      <Link route={`/openElections/${this.props.address}`}>
        <Button primary circular content='Voltar' icon='arrow left' labelPosition='left' />
      </Link>

      <Header as='h2' icon textAlign='center'>
        <Icon name='settings' circular />
        <Header.Content>Painel Admin da Eleição - {this.props.openElectionName}</Header.Content>
      </Header>

        {
        this.state.errorMessage &&
        (
        <Message error header="Oops!" content={this.state.errorMessage} />
        )
        }

       <Grid>

        <Grid.Row>

          <Grid.Column width={10}>
            {this.renderCards()}
          </Grid.Column>

          <Grid.Column width={6}>

          <Menu fluid vertical>
            <Menu.Item className='header'>Opções</Menu.Item>

            <Menu.Item>
              <Link route={`/openElections/${this.props.address}/admin/createCandidate`}>
                <Button primary>Cadastrar novo candidato</Button>
              </Link>
            </Menu.Item>

            <Menu.Item>
              <Button
                  onClick={event => this.setState( { startElectionMessageOpen: true } )}
                  loading={this.state.loadingStartElection}
                  disabled={this.state.disabledStartElection}
                  color='green'>
                  INICIAR Eleição
              </Button>
            </Menu.Item>

            <Menu.Item>
            <Button
                onClick={event => this.setState( { endElectionMessageOpen: true } )}
                loading={this.state.loadingEndElection}
                disabled={this.state.disabledEndElection}
                color='red'>
                Forçar Fim da Eleição
            </Button>
            </Menu.Item>

            </Menu>

          </Grid.Column>

        </Grid.Row>

        <Confirm
          open={this.state.startElectionMessageOpen}
          header='Está prestes a INICIAR a eleição!!!'
          content='Lembre-se que essa ação não poderá ser desfeita.'
          onConfirm={this.startOpenElection}
          onCancel={event =>
            this.setState({ startElectionMessageOpen: false }) }
         />

         <Confirm
           open={this.state.endElectionMessageOpen}
           header='Está prestes a FINALIZAR a eleição!!!'
           content='Lembre-se que essa ação não poderá ser desfeita.'
           onConfirm={this.endOpenElection}
           onCancel={event =>
             this.setState({ endElectionMessageOpen: false }) }
          />
       </Grid>

      </Layout>
    );
  }
}

export default OpenElectionAdmin;
