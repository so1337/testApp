import React from 'react';
import _ from 'lodash';
import ReactDOM from 'react-dom';
import request from 'request';
import { FormGroup, FormControl, ControlLabel, Button, ListGroupItem, ListGroup } from 'react-bootstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
const host = 'http://localhost:1337';
class Main extends React.Component {

  constructor(props) {
    super(props);
    this.requestList = this.requestList.bind(this);
    this.addItem = this.addItem.bind(this);
    this.buttonFormatter = this.buttonFormatter.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.state = {
      tableItems: null,
      fetchTableError: null,
      validations: {},
    }
  }
  //before mounting - make request
  componentWillMount() {
    this.requestList();
  }

  isJSON(string) {
    try {
      JSON.parse(string);
    } catch (e) {
      return false;
    }
    return true;
  }

  validate(values) {
    //validate each input value. If value not present - return error text.
    let firstName = !values.firstName && 'Enter correct first name';
    let lastName = !values.lastName && 'Enter correct last name';
    let profession = !values.profession && 'Enter correct profession';
    let age = !values.age && 'Enter correct age';
    return {
      age,
      profession,
      lastName,
      firstName
    };
  }

  addItem() {
    //combine inputs data and generating unique id based on inputs data.
    const data = {
      firstName: this.inputFirstName.value,
      lastName: this.inputLastName.value,
      profession: this.inputProfession.value,
      age: this.inputAge.value,
      _id: `${this.inputAge.value}-${_.trim(this.inputProfession.value)}${_.trim(this.inputLastName.value)}${_.trim(this.inputFirstName.value)}`
    };
    //validate inputs data.
    let errors = _.pickBy(this.validate(data));
    //if there's no validation errors - make request and after finish - update table.
    if(_.isEmpty(errors)) {
      request({
        method: 'POST',
        url: `${host}/items`,
        json: true,
        body: data
      }, (error, response) => {
        if (error){
          console.error(error);
        } else if (response.statusCode !== 200){
          console.error(response);
          if (response.body.statusCode === 409) {
            //if user already present - add this info to validations errors.
            let updatedErrors = Object.assign({}, errors, { item: 'This item is already present.'});
            this.setState({ validations:updatedErrors });
          }
        } else {
          this.requestList();
        }
      });
    }
    //set validations errors to state (or if non present - empty object)
    this.setState({ validations:errors });
  }

  deleteItem(item) {
    //delete item from list, after request finish - update table.
    const data = {
      rev: item._rev,
      _id: item._id
    };
    request({
      method: 'DELETE',
      url: `${host}/items`,
      json: true,
      body: data
    }, (error, response) => {
      if (error){
        console.error(error);
      } else if (response.statusCode !== 200){
        console.error(response);
      } else {
        this.requestList();
      }
    });
  }

  checkItem(item) {
    //check if item's id is correct.
    const check = `${item.age}-${_.trim(item.profession)}${_.trim(item.lastName)}${_.trim(item.firstName)}`;
    if (item._id === check){
      alert('id is correct');
    } else {
      alert('id is not correct');
    }
  }

  buttonFormatter(cell, row) {
    return (<div><Button onClick={ () => {this.deleteItem(row)} }>Delete item</Button> <Button onClick={ () => {this.checkItem(row)} }>Check id</Button></div>);
  }

  requestList() {
    //fetching table data, if error present - pass to fetchTableError.
    request(`${host}/items`, (error, response) => {
      if (error) {
        console.error(error);
        this.setState({ fetchTableError: 'Error occurred in table items GET request.' });
      } else if (response.statusCode !== 200) {
        console.error(response.body);
        this.setState({ fetchTableError: 'Error occurred in table items GET request.' });
      } else {
        //check if response body is correctly formatted JSON.
        if (this.isJSON(response.body)) {
          const tableItems = _.map(JSON.parse(response.body), (item) => item.doc);
          this.setState({ tableItems, fetchTableError: null });
        } else {
          this.setState({ fetchTableError: 'Server responded with not correct JSON.' });
        }
      }
    });
  }


  render() {
    let table = null;
    //if error in fetching table data - allow to retry request.
    if (this.state.fetchTableError) {
      table = (<div> {this.state.fetchTableError} <button onClick={this.requestList}>Retry</button> </div>)
    } else if (!this.state.tableItems) {
      //if there's no error and still no data - indicate data is loading.
      table = (<div>Loading ...</div>)
    } else {
      //if data present and no error - render table.
      table = (<BootstrapTable data={this.state.tableItems} hover={true}>
                <TableHeaderColumn dataField="_id" isKey={true} filter={ { type: 'TextFilter', delay: 600 } }>ID</TableHeaderColumn>
                <TableHeaderColumn dataField="firstName" filter={ { type: 'TextFilter', delay: 600 } }>First name</TableHeaderColumn>
                <TableHeaderColumn dataField="lastName" filter={ { type: 'TextFilter', delay: 600 } }>Last name</TableHeaderColumn>
                <TableHeaderColumn dataField="profession" filter={ { type: 'TextFilter', delay: 600 } }>Profession</TableHeaderColumn>
                <TableHeaderColumn dataField="age" filter={ { type: 'TextFilter', delay: 600 } }>Age</TableHeaderColumn>
                <TableHeaderColumn dataField="button" dataFormat={this.buttonFormatter}/>
              </BootstrapTable>)
    }
    // map validations object and render validations problems
    const validations = _.map(this.state.validations, (message, key) => (<ListGroupItem key={key} bsStyle="danger">{message}</ListGroupItem>));

    return (
      <div className="container">
        <h3>Add data form</h3>
        <div>
          <FormGroup >
            <ControlLabel>First name</ControlLabel>
            <FormControl inputRef={ref => { this.inputFirstName = ref; }} type="text" placeholder="Enter first name" />
          </FormGroup>
          <FormGroup >
            <ControlLabel>Last name</ControlLabel>
            <FormControl inputRef={ref => { this.inputLastName = ref; }} type="text" placeholder="Enter first name" />
          </FormGroup>
          <FormGroup >
            <ControlLabel>Profession</ControlLabel>
            <FormControl inputRef={ref => { this.inputProfession = ref; }} type="text" placeholder="Enter profession" />
          </FormGroup>
          <FormGroup >
            <ControlLabel>Age</ControlLabel>
            <FormControl inputRef={ref => { this.inputAge = ref; }} type="number" placeholder="Enter Age" />
          </FormGroup>
          <Button onClick={this.addItem}>
            Submit
          </Button>
        </div>
        <h3>Added items table</h3>
        {table}
        {!_.isEmpty(validations) && (<h3>Form validation errors</h3>)}
        <ListGroup>
          {validations}
        </ListGroup>
      </div>
    );
  }
}

ReactDOM.render((
  <Main />
), document.getElementById('app'));
