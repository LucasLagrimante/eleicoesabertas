import React, { Component } from 'react';
import Layout from '../../components/Layout';
import {
  Form,
  Button,
  Icon,
  Input,
  Message,
  Checkbox
} from 'semantic-ui-react';
import factory from '../../ethereum/factory';
import web3 from '../../ethereum/web3';
import { Link, Router } from '../../routes';

class OpenElectionNew extends Component {
  state = {
    maxCandidates: '',
    maxVoters: '',
    onlyAuthenticated: false,
    electionName: '',
    termos: false,
    errorMessage: '',
    sucessMessage: '',
    loading: false,
    disabled: false
  };

  onSubmit = async event => {
    event.preventDefault();

    this.setState( { loading: true, errorMessage: '', disabled: true } );

    try {
      if ( !this.state.termos ) {
        this.setState( { loading: false, disabled: false, errorMessage: 'Concorde com os termos!' } );
        return;
      } else if (!this.state.maxCandidates.length || !this.state.maxVoters.length || !this.state.electionName.length) {
        this.setState({ loading: false, disabled: false, errorMessage: 'Preencha todos os campos!' });
        return;
      }

      const accounts = await web3.eth.getAccounts();
      await factory.methods.createOpenElection( this.state.maxCandidates, this.state.maxVoters, this.state.onlyAuthenticated, this.state.electionName ).send( { from: accounts[ 0 ] } );

      this.setState( { sucessMessage: 'Eleição criada!' } );

      setTimeout(() => {
        Router.pushRoute(`/`);
      }, 3000);

    } catch ( e ) {
      this.setState( { errorMessage: e.message } )
    }

    this.setState( { loading: false, disabled: false } );
  };

  render() {
    return (
      <Layout>

      <Link route={`/`}>
        <Button primary circular content='Voltar' icon='arrow left' labelPosition='left' />
      </Link>

      <h3>Criando uma eleição</h3>

      {
      this.state.sucessMessage &&
      (
      <Message success header='Sucesso!' content={this.state.sucessMessage} />
      )
      }

      <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
        <Form.Field required>
          <label>Nome da Eleição</label>
          <Input placeholder='Nome da Eleição' value={this.state.electionName} onChange={event => this.setState( { electionName: event.target.value } )}/>
        </Form.Field>

        <Form.Field required>
          <label>Número máximo de candidatos
          </label>
          <Input
            placeholder='Número máximo de candidatos'
            value={this.state.maxCandidates}
            type='number'
            onChange={event => this.setState( { maxCandidates: event.target.value } )}/>
        </Form.Field>

        <Form.Field required>
          <label>Número máximo de eleitores
          </label>
          <Input placeholder='Número máximo de eleitores' value={this.state.maxVoters} type='number' onChange={event => this.setState( { maxVoters: event.target.value } )}/>
        </Form.Field>

        <Form.Checkbox inline label='Apenas Usuários Autenticados' toggle value={this.state.onlyAuthenticated} onChange={event => this.setState( {
            onlyAuthenticated: !this.state.onlyAuthenticated
          } )}/>

        <Form.Checkbox
         required
         inline
         label='Concordo com os termos'
         toggle
         value={this.state.termos}
         onChange={event => this.setState( { termos: !this.state.termos} )}
        />

        <Message error header="Oops!" content={this.state.errorMessage} />

        <Button loading={this.state.loading} disabled={this.state.disabled} animated primary>
          <Button.Content visible>Criar!</Button.Content>
          <Button.Content hidden>
            <Icon name='plus'/>
          </Button.Content>
        </Button>

      </Form>

    </Layout>
    );
  }
}

export default OpenElectionNew;
