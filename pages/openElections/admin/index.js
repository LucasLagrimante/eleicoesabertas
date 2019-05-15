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
    const isManager = account == summary[0] ? true : false;

    return {
      address: props.query.address,
      isManager: isManager,
      numVoters: numVoters,
      numCandidates: numCandidates,
      maxVoters: summary[2],
      maxCandidates: summary[3],
      totalVotes: summary[4],
      onlyAuthenticated: summary[5],
      isEnded: summary[6],
      isStarted: summary[7],
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
      isStarted
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
        description: 'Número de ELEITORES cadastrados na eleição da eleição.'
      },
      {
        header: numCandidates,
        meta: 'Número de candidatos cadastrados',
        description: 'Número de CANDIDATOS cadastrados na eleição da eleição.'
      },
      {
        header: totalVotes,
        meta: 'Votos Computados',
        description: 'Número de votos válidos.'
      },
      {
        header: onlyAuthenticated.toString(),
        meta: 'Apenas usuários Autenticados',
        description: 'Essa flag garante que apenas usuários autenticados poderão votar.'
      },
      {
        header: isEnded.toString(),
        meta: 'Terminou?',
        description: 'Essa flag nos diz se a votação está terminada.'
      },
      {
        header: isStarted.toString(),
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

    this.setState({ loadingStartElection: false, disabledStartElection: false });
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

    this.setState({ loadingEndElection: false, disabledEndElection: false });
  };

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
    return (
      <Layout>
        {this.onWeb3ProviderChange()}

        <Link route={`/openElections/${this.props.address}`}>
          <a>
            <Button primary circular content='Voltar' icon='arrow left' labelPosition='left' />
          </a>
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

                {
                  !this.props.isStarted &&
                  (
                    <Menu.Item>
                      <Link route={`/openElections/${this.props.address}/admin/createCandidate`}>
                        <a>
                          <Button primary>Cadastrar novo candidato</Button>
                        </a>
                      </Link>
                    </Menu.Item>
                  )
                }

                {
                  !this.props.isStarted &&
                  (
                    <Menu.Item>
                      <Button
                        onClick={event => this.setState({ startElectionMessageOpen: true })}
                        loading={this.state.loadingStartElection}
                        disabled={this.state.disabledStartElection}
                        color='green'>
                        INICIAR Eleição
                    </Button>
                    </Menu.Item>
                  )
                }

                {
                  this.props.isEnded &&
                  (
                    <Menu.Item>
                      <Button
                        onClick={event => this.setState({ endElectionMessageOpen: true })}
                        loading={this.state.loadingEndElection}
                        disabled={this.state.disabledEndElection}
                        color='red'>
                        Forçar Fim da Eleição
                    </Button>
                    </Menu.Item>
                  )
                }


              </Menu>

            </Grid.Column>

          </Grid.Row>

          <Confirm
            open={this.state.startElectionMessageOpen}
            header='Está prestes a INICIAR a eleição!!!'
            content='Lembre-se que essa ação não poderá ser desfeita.'
            onConfirm={this.startOpenElection}
            onCancel={event =>
              this.setState({ startElectionMessageOpen: false })}
          />

          <Confirm
            open={this.state.endElectionMessageOpen}
            header='Está prestes a FINALIZAR a eleição!!!'
            content='Lembre-se que essa ação não poderá ser desfeita.'
            onConfirm={this.endOpenElection}
            onCancel={event => this.setState({ endElectionMessageOpen: false })}
          />
        </Grid>

      </Layout>
    );
  }
}

export default OpenElectionAdmin;
