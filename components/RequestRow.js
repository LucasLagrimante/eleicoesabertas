import React, { Component } from 'react';
import { Table, Button } from 'semantic-ui-react';
import web3 from '../ethereum/web3';
import OpenElection from '../ethereum/openelection';
import { Router } from '../routes';

class RequestRow extends Component {

  state = {
    loading: false,
  };

  onApprove = async () => {
    const openElection = OpenElection(this.props.address);
    const [account] = await web3.eth.getAccounts();

    try {
      this.setState({ errorMessage: '', messageOpen: false, loading: true });

      await openElection.methods.resolveRequest(this.props.id, this.props.request.where, true).send({
        from: account
      });
    } catch (e) {
      if (e.message == 'No "from" address specified in neither the given options, nor the default options.') {
        this.setState({ errorMessage: "Há algum problema com nossa conexão com o MetaMask, verifique se o modo privado está ativo!" })
      } else {
        this.setState({ errorMessage: e.message })
      }
    }

    this.setState({ errorMessage: '', messageOpen: false, loading: false });

    Router.pushRoute(`/openElections/${this.props.address}/admin/requests`);
  }

  onDecline = async () => {
    const openElection = OpenElection(this.props.address);
    const [account] = await web3.eth.getAccounts();

    try {
      this.setState({ errorMessage: '', messageOpen: false, loading: true });

      await openElection.methods.resolveRequest(this.props.id, this.props.request.where, false).send({
        from: account
      });
    } catch (e) {
      if (e.message == 'No "from" address specified in neither the given options, nor the default options.') {
        this.setState({ errorMessage: "Há algum problema com nossa conexão com o MetaMask, verifique se o modo privado está ativo!" })
      } else {
        this.setState({ errorMessage: e.message })
      }
    }

    this.setState({ errorMessage: '', messageOpen: false, loading: false });

    Router.pushRoute(`/openElections/${this.props.address}/admin/requests`);
  }

  render() {
    const { Row, Cell } = Table;
    const { id, request } = this.props;

    return (
      <Row disabled={request.complete} positive={!request.complete}>

        <Cell>{id + 1}</Cell>
        <Cell>{request.where}</Cell>
        <Cell>
          <Button
            color="green"
            disabled={request.complete || this.state.loading}
            loading={this.state.loading}
            basic
            onClick={this.onApprove}>Aprovar</Button>
        </Cell>
        <Cell>
          <Button
            color="red"
            disabled={request.complete || this.state.loading}
            loading={this.state.loading}
            basic
            onClick={this.onDecline}>Recusar</Button>
        </Cell>

      </Row>
    );
  }
}

export default RequestRow;
