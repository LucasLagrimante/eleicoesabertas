import React, { Component } from 'react';
import Layout from '../../components/Layout';
import OpenElection from '../../ethereum/openelection';
import { Card, Grid, Button, Menu, Header, Icon, Image, Confirm, Message, Segment, Loader } from 'semantic-ui-react';
import web3 from '../../ethereum/web3';
import { Link, Router } from '../../routes';

class OpenElectionVoting extends Component {

  static async getInitialProps(props) {
    const { address } = props.query;

    const openElection = OpenElection(address);
    const candidatesCount = await openElection.methods.getNumOfCandidates().call();
    const openElectionName = await openElection.methods.electionName().call();

    const candidates = await Promise.all(
      Array(parseInt(candidatesCount)).fill().map((element, index) => {
        return openElection.methods.getCandidateInfo(index).call()
      })
    );

    return {
      address,
      candidatesCount,
      candidates,
      openElectionName
    };
  }

  state = {
    messageOpen: false,
    loading: false,
    errorMessage: '',
    candidateClicked: ''
  };

  renderCards() {
    return this.props.candidates.map((candidate, index) => {
      return (
        <Card key={index} onClick={event => this.setState({ candidateClicked: candidate, messageOpen: true })}>
          <Image src='https://react.semantic-ui.com/images/avatar/large/matthew.png' wrapped ui={false} />
          <Card.Content>
            <Card.Header>{candidate[0]}</Card.Header>
            <Card.Description>
              {candidate[1].substring(1, 25)}...
              </Card.Description>
          </Card.Content>
        </Card>
      );
    });
  }

  vote = async event => {
    event.preventDefault();
    this.setState({ errorMessage: '', messageOpen: false, loading: true });

    try {
      const [account] = await web3.eth.getAccounts();
      const openElection = OpenElection(this.props.address);

      await openElection.methods.vote(this.state.candidateClicked[1])
        .send({
          from: account
        });

      setTimeout(() => {
        Router.pushRoute(`/openElections/${this.props.address}`);
      }, 3000);

    } catch (e) {

      setTimeout(() => {
        Router.pushRoute(`/openElections/${this.props.address}`);
      }, 3000);

      if (e.message == 'No "from" address specified in neither the given options, nor the default options.') {
        this.setState({ errorMessage: "Há algum problema com nossa conexão com o MetaMask, verifique se o modo privado está ativo!" })
      } else {
        this.setState({ errorMessage: e.message })
      }
    }

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
          <Icon name='users' circular />
          <Header.Content>Votação - Escolha seu candidado</Header.Content>
        </Header>

        {
          !this.state.loading &&
          (
            <Card.Group>
              {this.renderCards()}
            </Card.Group>
          )
        }

        {
          this.state.loading &&
          (
            <Segment>
              <Loader active size='medium'>Votando...</Loader>
              <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
            </Segment>
          )
        }

        <br /><div>Foram encontrados {this.props.candidatesCount} candidatos cadastrados.</div>

        <Confirm
          open={this.state.messageOpen}
          header={"Confirme seu voto no candidato de nome: " + this.state.candidateClicked[0]}
          content='Lembre-se que essa ação não poderá ser desfeita.'
          onConfirm={this.vote}
          onCancel={event =>
            this.setState({ messageOpen: false })}
        />

      </Layout>
    );
  }
}

export default OpenElectionVoting;
