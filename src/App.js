import React, { Component,useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
// eslint-disable-next-line
import { Alert, Container, Dropdown, Navbar, Row, Button, Col, DropdownButton, Card, Modal, Table,Form } from 'react-bootstrap'
import InputGroup from 'react-bootstrap/InputGroup'
import DayPickerInput from "react-day-picker/DayPickerInput";
import "react-day-picker/lib/style.css";
import './App.css';

// import result from './data.json';
import { Select } from "react-dropdown-select";
import {load_posts} from "./MyComponents/Methods"

class App extends Component {
  state = {
    SN : "",
    start_date: 0,
    end_date: 0,
    fields: {},
    table_body : []
  };
  initial_state = { ...this.state };
  constructor() {
    super();

  }
  componentDidMount() {
    load_posts()
  }


  render() {

    return (
        <>
          <Navbar expand="lg" bg="dark" variant="dark">
            <Navbar.Brand href="#home">
              APP
            </Navbar.Brand>
          </Navbar>
          <Container className='mt-4 mb-4'>
              <Row className='ml-4 mr-4 mb-4'>
                <DropdownButton
                    key="SN-button"
                    id="SN-button"
                    title="Соц. Сеть"
                >
                  <Dropdown.Item eventKey="1">ВКонтакте</Dropdown.Item>
                  <Dropdown.Item eventKey="2">Телеграм</Dropdown.Item>
                </DropdownButton>

                <DayPickerInput style={{margin:10}} placeholder={"Дата начала"} onDayChange={day => console.log(day)} />
                <DayPickerInput style={{margin:10}} placeholder={"Дата конца"} onDayChange={day => console.log(day)} />
              </Row>
              <Row className='ml-4 mr-4 mb-4'>
                  {/* eslint-disable-next-line react/jsx-no-undef */}
                  <Form.Group controlId="exampleForm.ControlTextarea1">
                      <Form.Label>Example textarea</Form.Label>
                      <Form.Control as="textarea" rows="3" />
                  </Form.Group>
              </Row>
              <Row className='ml-4 mr-4 mb-4'>
                  <Button variant="primary" size="lg" block>
                      Block level button
                  </Button>
              </Row>
              <Row className='ml-4 mr-4 mb-4'>
                  <Table striped bordered hover>
                  <thead>
                  <tr>
                      <th>#</th>
                      <th>Группа</th>
                      <th>Ссылка</th>
                      <th>Текст поста</th>
                      <th>Просмотры</th>
                      <th>Лайки</th>
                      <th>Репосты</th>
                      <th>Комментарии</th>
                  </tr>
                  </thead>
                      <tbody>
                      {this.state.table_body}
                      </tbody>
                  </Table>
                  </Row>
               </Container>
        </>
    );
  }
}

export default App;