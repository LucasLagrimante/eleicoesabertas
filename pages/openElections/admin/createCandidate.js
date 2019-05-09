import React, { Component } from 'react';
import Layout from '../../../components/Layout';
import OpenElection from '../../../ethereum/openelection';
import {	Form,	Button,	Icon, Input, Message, Checkbox, Confirm} from 'semantic-ui-react';
import factory from '../../../ethereum/factory';
import web3 from '../../../ethereum/web3';
import { Link, Router } from '../../../routes';

class OpenElectionCreateCandidate extends Component {
	static async getInitialProps( props ) {
		return { address: props.query.address };
	}

	state = {
		createCandidateMessageOpen: false,
		completeName: '',
		cpf: '',
		candidateAddress: '',
		termos: false,
		loading: false,
		disabled: false,
		errorMessage: '',
		sucessMessage: ''
	};

	onSubmit = async event => {
		event.preventDefault();
		this.setState( { loading: true, errorMessage: '', disabled: true, createCandidateMessageOpen: false } );

		try {
			if ( !this.state.termos ) {
				this.setState( { loading: false, disabled: false, errorMessage: 'Concorde com os termos!' } );
				return;
			} else if ( !this.state.completeName.length || !this.state.cpf.length || !this.state.candidateAddress.length ) {
				this.setState( { loading: false, disabled: false, errorMessage: 'Preencha todos os campos!' } );
				return;
			} else if ( this.state.cpf.length != 11 ) {
				this.setState( { loading: false, disabled: false, errorMessage: 'Preencha o CPF corretamente!' } );
				return;
			} else if ( this.state.candidateAddress.length != 42 ) {
				this.setState( { loading: false, disabled: false, errorMessage: 'Preencha o endereço do candidato corretamente!' } );
				return;
			}

			const accounts = await web3.eth.getAccounts();
			const openElection = OpenElection( this.props.address );
			await openElection.methods.createCandidate( this.state.completeName, this.state.cpf, this.state.candidateAddress )
			.send({
				 from: accounts[0]
			 });

			 this.setState( { sucessMessage: 'Candidato Criado!' } );

			 setTimeout(() => {
				 Router.pushRoute(`/openElections/${this.props.address}/admin`);
       }, 3000);

		} catch ( e ) {
			this.setState( { errorMessage: e.message } )
		}

		this.setState( { loading: false, disabled: false } );
		};

		render() {
			return (
				<Layout>

				<Link route={`/openElections/${this.props.address}/admin`}>
	        <Button primary circular content='Voltar' icon='arrow left' labelPosition='left' />
	      </Link>

				<h3>Cadastrar novo candidato</h3>

				{
	      this.state.sucessMessage &&
	      (
	      <Message success header='Sucesso!' content={this.state.sucessMessage} />
	      )
	      }

				<Form error={!!this.state.errorMessage}>

					<Form.Field required>
						<label>Nome Completo</label>
						<Input
						placeholder='Nome Completo'
						value={this.state.completeName}
						onChange={event => this.setState( { completeName: event.target.value } )}/>
					</Form.Field>

					<Form.Field required>
						<label>CPF</label>
						<Input
						placeholder='CPF'
						maxLength="11"
						value={this.state.cpf}
						type='text'
						onChange={event => this.setState( { cpf: event.target.value } )}/>
					</Form.Field>

					<Form.Field required>
						<label>Endereço Ethereum</label>
						<Input
						placeholder='Endereço Ethereum'
						maxLength="42"
						value={this.state.candidateAddress}
						type='text'
						onChange={event => this.setState( { candidateAddress: event.target.value } )}/>
					</Form.Field>

					<Form.Checkbox required inline label='Concordo com os termos' toggle
					 value={this.state.termos}
					 onChange={event => this.setState( { termos: !this.state.termos } )} />

					<Message error header="Oops!" content={this.state.errorMessage}/>

					<Button
							onClick={event => this.setState( { createCandidateMessageOpen: true } )}
							loading={this.state.loading}
							disabled={this.state.disabled}
							animated
							primary
					>
						<Button.Content visible>Vamos lá!!</Button.Content>
						<Button.Content hidden>
							<Icon name='plus'/>
						</Button.Content>
					</Button>

					<Confirm
						open={this.state.createCandidateMessageOpen}
						header='Está prestes a criar um novo candidato!!!'
						content='Lembre-se que: Essa ação não poderá ser desfeita.'
						onConfirm={this.onSubmit}
						onCancel={event => this.setState( { createCandidateMessageOpen: false } )}/>

				</Form>
			</Layout>
		 );
	}
}
export default OpenElectionCreateCandidate;
