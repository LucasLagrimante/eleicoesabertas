import React, { Component } from "react";
import Layout from "../../components/Layout";
import OpenElection from "../../ethereum/openelection";
import { Card, Grid, Button, Menu, Confirm } from "semantic-ui-react";
import web3 from "../../ethereum/web3";
import { Link, Router } from "../../routes";

class OpenElectionIndex extends Component {
  static async getInitialProps(props) {
    const { address } = props.query;

    const openElection = OpenElection(address);
    const summary = await openElection.methods.getSummary().call();
    const [account] = await web3.eth.getAccounts();

    return {
      openElection,
      account,
      address,
      manager: summary[0],
      winner: summary[1],
      maxVoters: summary[2],
      maxCandidates: summary[3],
      totalVotes: summary[4],
      onlyAuthenticated: summary[5],
      isEnded: summary[6],
      isStarted: summary[7],
      openElectionName: summary[8].toString()
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      isVoter: false,
      isCandidate: false,
      requestAuthenticationMessageOpen: false,
      loadingRequestAuthentication: false,
      disabledRequestAuthentication: false,
      errorMessage: ''
    }

    this.isVoter();
    this.isCandidate();
  }

  renderCards() {
    const {
      manager,
      winner,
      maxVoters,
      maxCandidates,
      totalVotes,
      onlyAuthenticated,
      isEnded,
      isStarted
    } = this.props;

    const items = [
      {
        header: manager,
        meta: "Endereço do Administrador",
        description:
          "O admnistrador criou essa eleição e pode inicia-la e termina-la.",
        style: { overflowWrap: "break-word" }
      },
      {
        header: winner,
        meta: "Vencedor",
        description: "Primeiro lugar.",
        style: { overflowWrap: "break-word" }
      },
      {
        header: maxVoters,
        meta: "Número máximo de votos",
        description:
          "Número máximo de votos possíveis, definidos na criação da eleição."
      },
      {
        header: maxCandidates,
        meta: "Número máximo de candidatos",
        description:
          "Número máximo de candidatos possíveis, definidos na criação da eleição."
      },
      {
        header: totalVotes,
        meta: "Votos Computados",
        description: "Número de votos válidos."
      },
      {
        header: onlyAuthenticated.toString(),
        meta: "Apenas usuários Autenticados",
        description:
          "Essa flag garante que apenas usuários autenticados poderão votar."
      },
      {
        header: isEnded.toString(),
        meta: "Terminou?",
        description: "Essa flag nos diz se a votação está terminada."
      },
      {
        header: isStarted.toString(),
        meta: "Começou?",
        description: "Essa flag nos diz se já podemos votar nessa eleição."
      }
    ];

    return <Card.Group items={items} />;
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

  isVoter = async event => {
    try {
      let result = await OpenElection(this.props.address).methods.isVoterBool(web3.currentProvider.selectedAddress).call();
      this.setState({ isVoter: result });
    } catch (e) {
      this.setState({ isVoter: false });
    }
  };

  isCandidate = async event => {
    try {
      let result = await OpenElection(this.props.address).methods.isCandidateBool(web3.currentProvider.selectedAddress).call();
      this.setState({ isCandidate: result });
    } catch (e) {
      this.setState({ isCandidate: false });
    }
  };

  requestAuthentication = async event => {
    event.preventDefault();
    this.setState({ loadingRequestAuthentication: true, disabledRequestAuthentication: true, requestAuthenticationMessageOpen: false });

    try {
      const [account] = await web3.eth.getAccounts();
      const openElection = OpenElection(this.props.address);
      
      await openElection.methods.createRequest().send({
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

    this.setState({ loadingRequestAuthentication: false, disabledRequestAuthentication: false });
  };

  render() {
    return (
      <Layout>
        {this.onWeb3ProviderChange()}

        <Link route={`/`}>
          <a>
            <Button primary circular content="Voltar" icon="arrow left" labelPosition="left" />
          </a>
        </Link>

        <h3>Detalhes da Eleição - {this.props.openElectionName}</h3>

        <Grid>
          <Grid.Row>
            <Grid.Column width={10}>{this.renderCards()}</Grid.Column>

            <Grid.Column width={6}>
              <Menu fluid vertical>
                <Menu.Item className="header">Opções</Menu.Item>

                {
                  this.props.isEnded &&
                  (
                    <Menu.Item>
                      <Link route={`/openElections/${this.props.address}/finalResult`}                      >
                        <a>
                          <Button color="brown">Resultados Finais</Button>
                        </a>
                      </Link>
                    </Menu.Item>
                  )
                }

                {
                  this.props.manager === this.props.account &&
                  (
                    <Menu.Item>
                      <Grid.Column width={3}>
                        <Link route={`/openElections/${this.props.address}/admin`} >
                          <a>
                            <Button inverted color="red">
                              Painel Admin
                            </Button>
                          </a>
                        </Link>
                      </Grid.Column>
                    </Menu.Item>
                  )
                }

                {
                  this.props.manager !== this.props.account && !this.props.isEnded &&
                  this.props.isStarted && this.state.isVoter &&
                  (
                    <Menu.Item>
                      <Link route={`/openElections/${this.props.address}/voting`} >
                        <a>
                          <Button inverted content='Votar!!' color="blue" />
                        </a>
                      </Link>
                    </Menu.Item>
                  )
                }

                {
                  this.props.manager !== this.props.account && !this.props.isEnded &&
                  !this.props.isStarted && !this.state.isVoter && !this.state.isCandidate &&
                  (
                    <Menu.Item>
                      <Link route={`/openElections/${this.props.address}/beAnVoter`} >
                        <a>
                          <Button inverted content='Se tornar um eleitor' color="blue" />
                        </a>
                      </Link>
                    </Menu.Item>
                  )
                }

                {
                  this.props.manager !== this.props.account && !this.props.isEnded &&
                  !this.props.isStarted && (this.state.isVoter || this.state.isCandidate) &&
                  (
                    <Menu.Item>
                      <a>
                        <Button
                          onClick={event => this.setState({ requestAuthenticationMessageOpen: true })}
                          inverted content='Solicitar Autenticação'
                          color="blue"
                          loading={this.state.loadingRequestAuthentication}
                          disabled={this.state.disabledRequestAuthentication}
                        />
                      </a>
                    </Menu.Item>
                  )
                }

                <Confirm
                  open={this.state.requestAuthenticationMessageOpen}
                  header='Está prestes a requisitar uma autenticação!!!'
                  content='Lembre-se que essa ação não poderá ser desfeita.'
                  onConfirm={this.requestAuthentication}
                  onCancel={event =>
                    this.setState({ requestAuthenticationMessageOpen: false })}
                />
              </Menu>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Layout >
    );
  }
}

export default OpenElectionIndex;
