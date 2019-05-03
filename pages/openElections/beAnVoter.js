import React, { Component } from 'react';
import Layout from '../../components/Layout';
import OpenElection from '../../ethereum/openelection';
import { Form, Button, Icon, Input, Message, Checkbox, Confirm } from 'semantic-ui-react';
import factory from '../../ethereum/factory';
import web3 from '../../ethereum/web3';
import { Link, Router } from '../../routes';

class OpenElectionBeAnVoter extends Component {
  static async getInitialProps(props) {
    return { address: props.query.address };
  }

  state = {
    beAnVoterMessageOpen: false,
    cpf: '',
    completeName: '',
    termos: false,
    loading: false,
    disabled: false
  };

  onSubmit = async event => {
    event.preventDefault();
    this.setState({ loading: true, errorMessage: '', disabled: true, beAnVoterMessageOpen: false });

    try {
      if (!this.state.termos) {
        this.setState({ loading: false, disabled: false, errorMessage: 'Concorde com os termos!' });
        return;
      } else if (!this.state.completeName.length || !this.state.cpf.length) {
        this.setState({ loading: false, disabled: false, errorMessage: 'Preencha todos os campos!' });
        return;
      } else if (this.state.cpf.length != 11) {
        this.setState({ loading: false, disabled: false, errorMessage: 'Preencha o CPF corretamente!' });
        return;
      }

      const accounts = await web3.eth.getAccounts();
      const openElection = OpenElection(this.props.address);
      await openElection.methods.beAnVoter(this.state.completeName, this.state.cpf)
      .send({
        from: accounts[0]
      });

      Router.pushRoute(`/openElections/${this.props.address}`);
    } catch (e) {
      this.setState({ errorMessage: e.message })
    }

    this.setState({ loading: false, disabled: false });
  };

  render() {
    return (
      <Layout>

      <Link route={`/openElections/${this.props.address}`}>
        <Button primary circular content='Voltar' icon='arrow left' labelPosition='left' />
      </Link>

      <h3>Se tornando um eleitor</h3>
      <Form error={!!this.state.errorMessage}>
        <Form.Field required>
          <label>Nome Completo</label>
          <Input
           placeholder='Nome Completo'
           value={this.state.completeName}
           onChange={event =>
            this.setState({ completeName: event.target.value }) } />
        </Form.Field>
        <Form.Field required>
          <label>CPF</label>
          <Input
           placeholder='CPF'
           maxLength="11"
           value={this.state.cpf}
           type='text'
           onChange={event =>
             this.setState({ cpf: event.target.value }) } />
        </Form.Field>

        <Form.Checkbox
           required
           inline
           label='Concordo com os termos'
           toggle
           value={this.state.termos}
           onChange={event =>
             this.setState({ termos: !this.state.termos }) }
         />

          <Message error header="Oops!" content={this.state.errorMessage} />

          <Button
           onClick={event =>
             this.setState({ beAnVoterMessageOpen: true }) } loading={this.state.loading} disabled={this.state.disabled} animated primary>
            <Button.Content visible>Vamos lá!!</Button.Content>
            <Button.Content hidden>
              <Icon name='plus' />
            </Button.Content>
          </Button>

          <Confirm
            open={this.state.beAnVoterMessageOpen}
            header='Está prestes a se tornar um eleitor!!!'
            content='Lembre-se que: Essa ação não poderá ser desfeita, você não poderá ser um candidato e você poderá votar somente uma vez nessa eleição.'
            onConfirm={this.onSubmit}
            onCancel={event =>
              this.setState({ beAnVoterMessageOpen: false }) }
           />

        </Form>

      </Layout>
    );
  }
}

export default OpenElectionBeAnVoter;
