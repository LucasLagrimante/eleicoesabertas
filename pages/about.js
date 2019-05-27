import React, { Component } from 'react';
import Layout from '../components/Layout';
import { Router } from '../routes';
import { Button, Header, Icon, Image, Modal } from 'semantic-ui-react'

class OpenElectionAbout extends Component {
  state = {
    open: true
  };


  close = () => {
    this.setState({ open: false });
    Router.pushRoute(`/`);
  }

  render() {

    return (
      <Layout>

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

              <p>Seu uso é livre e o código se encontra público em <a target="_blank" href='https://github.com/LucasLagrimante/eleicoesabertas'>Eleições Abertas.</a>
              </p>

              <p>Para utilização é necessária a instalação de uma extensão do navegador que permite a integração da Blockchain Ethereum com nossa aplicação chamado <a target="_blank" href='https://metamask.io/'>MetaMask.</a>
              </p>

              <p>Para obter ether grátis na subnet Rinkeby, que é onde estamos, acesse: <a target="_blank" href='https://faucet.rinkeby.io/'>Rinkeby Authenticated Faucet.</a>
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

export default OpenElectionAbout;
