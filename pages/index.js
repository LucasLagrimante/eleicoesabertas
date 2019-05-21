import React, { Component } from 'react';
import factory from '../ethereum/factory';
import Layout from '../components/Layout';
import { Link, Router } from '../routes';
import OpenElection from "../ethereum/openelection";
import { Button, Card, Header, Icon, Image, Modal } from 'semantic-ui-react'

class OpenElectionIndex extends Component {

  static async getInitialProps() {
    const openElectionsAddressArray = await factory.methods.getDeployedOpenElections().call();
    const openElectionsCount = await factory.methods.getDeployedOpenElectionsCount().call();

    const openElections = await Promise.all(
      Array(parseInt(openElectionsCount)).fill().map((element, index) => {
        return {
          openElectionNames: OpenElection(openElectionsAddressArray[index]).methods.electionName().call(function (err, result) {
            return result;
          }),
          openElectionName: 'Eleição ' + index,
          address: openElectionsAddressArray[index]
        }
      })
    );

    openElections.reverse();

    return { openElections, openElectionsCount }
  }

  state = {
    open: true
  };

  renderOpenElections() {
    const items = this.props.openElections.map((element, index) => {

      return {
        header: element.openElectionName.toString(),
        meta: element.address,
        description: (
          <Link route={`/openElections/${element.address}`}>
            <a>Ver Eleição Aberta</a>
          </Link>
        ),
        fluid: true
      }

    });

    return <Card.Group items={items} />;
  }

  close = () => this.setState({ open: false })

  render() {

    return (
      <Layout>
        <div>

          <h3> Eleições Criadas </h3>

          <Link route='/openElections/new'>
            <a>
              <Button primary animated='fade' floated="right">
                <Button.Content visible>Criar Eleição Aberta</Button.Content>
                <Button.Content hidden>Agora mesmo!!</Button.Content>
              </Button>
            </a>
          </Link>

          {this.renderOpenElections()}

          <br />
          <div>Foram encontradas {this.props.openElections.length} eleições.</div>

        </div>

        <Modal dimmer='blurring' open={this.state.open}>
          <Modal.Header>Seja bem vindo ao sistema de eleições abertas</Modal.Header>
          <Modal.Content image scrolling>
            <Image size='medium' src='https://i.imgur.com/FuT8KCH.png' />

            <Modal.Description>
              <Header>Sobre</Header>

              <p>Esse sistema foi desenvolvido para
               obtenção de nota na disciplina de
                Trabalho de Conclusão de Curso do aluno Lucas Lagrimante Martinho.
              </p>
              <p>Instituto Federal de Educação Ciência e Tecnologia de Minas Gerais - Campus Juiz de Fora.</p>
              <p>Orientador:  Filippe Coury Jabour Neto.</p>

              <p>Seu uso é livre e o código se encontra público em <a src='https://github.com/LucasLagrimante/eleicoesabertas'>Eleições Abertas.</a>
              </p>

              <p>Para utilização é necessária a instalação de uma extensão do navegador que permite a integração da Blockchain Ethereum com nossa aplicação chamado <a src='https://metamask.io/'>MetaMask.</a>
              </p>

              <p>Para obter ether grátis na subnet Rinkeby, que é onde estamos, acesse: <a src='https://faucet.rinkeby.io/'>Rinkeby Authenticated Faucet.</a>
              </p>

            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            <Button
              color='green'
              onClick={this.close}
            >
              continuar <Icon name='chevron right' />
            </Button>
          </Modal.Actions>
        </Modal>

      </Layout>
    )
  }
}

export default OpenElectionIndex;
