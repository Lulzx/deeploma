import React, {Component} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    Container,
    Navbar,
    Row,
    Button,
    Form
} from 'react-bootstrap'

import MomentLocaleUtils, {formatDate, parseDate} from 'react-day-picker/moment';
import DayPickerInput from "react-day-picker/DayPickerInput";
import "./MyComponents/date_unput.css"
import "react-day-picker/lib/style.css";
import './App.css';

import moment from "moment";
import 'moment/locale/ru'
import {Helmet} from 'react-helmet'
import Select from "react-dropdown-select";

import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, {
    dateFilter,
    numberFilter,
    textFilter,
    selectFilter
} from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';

const expandRow = {
    onlyOneExpanding: true,
    renderer: row => (
        <div>
            <p>Полный текст:</p>
            <p>'${row.text}'</p>
        </div>
    )
};

class App extends Component {
    state = {
        Chosen_SN: "",
        SN: "",
        today: new Date(),
        groups: [],
        data: [],
        sm_ids: [],
        columns: [{
            text: "Тут будут посты"
        }],
        from: undefined,
        to: undefined,
        buttonDisable: true,
        isLoading: false
    };
    initial_state = {...this.state};


    constructor() {
        super();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        this.handleFromChange = this.handleFromChange.bind(this);
        this.handleToChange = this.handleToChange.bind(this);
        // this.handleSelect = this.handleSelect.bind(this);
        // this.load_data = this.load_data.bind(this);
        this.handleInput = this.handleInput.bind(this);
    }

    handleSelect(SN) {
        let columns = []

        function formatDate(date) {
            return new Date(date).toLocaleString('ru-RU')
        }

        switch (SN) {
            case ('vk'):
                columns = [
                    {
                        text: "Группа",
                        dataField: 'group_name',
                        filter: selectFilter({
                            options: this.state.groups,
                            placeholder: ' '
                        })
                    },
                    {
                        text: "Подписчики",
                        dataField: "members",
                        filter: numberFilter({placeholder: 'Введите значение'})
                    },
                    {
                        text: "Дата, время",
                        dataField: "post_date",
                        formatter: formatDate,
                        filter: dateFilter({
                            style: {width: "100%"},
                            placeholder: 'Введите дату'
                        })
                    }
                    ,
                    {
                        text: "Текст/n",
                        dataField: "text",
                        filter: textFilter({placeholder: 'Введите значение'})

                    }
                    ,
                    {
                        text: "Просмотры",
                        dataField: "views",
                        filter: numberFilter({placeholder: 'Введите значение'}),
                        sort: true
                    }
                    ,
                    {
                        text: "Лайки",
                        dataField: "likes",
                        filter: numberFilter({placeholder: 'Введите значение'}),
                        sort: true
                    }
                    ,
                    {
                        text: "Репосты",
                        dataField: "reposts",
                        filter: numberFilter({placeholder: 'Введите значение'}),
                        sort: true
                    }
                    ,
                    {
                        text: "Комментарии",
                        dataField: "comments",
                        filter: numberFilter({placeholder: 'Введите значение'}),
                        sort: true
                    }
                    ,
                    {
                        text: "Аномальные просмотры",
                        dataField: "is_anomaly",
                        filter: selectFilter({
                            options: {
                                0: 'Да',
                                1: 'Нет'
                            },
                            placeholder: ' '
                        })
                    },
                    {
                        text: "Тональный характер",
                        dataField: "sentiment",
                        filter: selectFilter({
                            options: {
                                0: 'Позитивный',
                                1: 'Нейтральный',
                                2: 'Негативный'
                            },
                            placeholder: ' '
                        })
                    }
                ]
                this.setState({columns: columns, buttonDisable: this.isReady(), Chosen_SN: SN})
                break;
            case ('tg'):
                columns = [
                    {
                        text: "Группа",
                        dataField: 'group_name',
                        filter: selectFilter({
                            options: this.state.groups,
                            placeholder: ' '
                        })
                    },
                    {
                        text: "Подписчики",
                        dataField: "members",
                        filter: numberFilter({placeholder: 'Введите значение'})
                    },
                    {
                        text: "Дата, время",
                        dataField: "post_date",
                        formatter: formatDate,
                        filter: dateFilter({style: {width: "100%"}, placeholder: 'Введите дату'})
                    }
                    ,
                    {
                        text: "Текст",
                        dataField: "text",
                        filter: textFilter({placeholder: 'Введите значение'})
                    }
                    ,
                    {
                        text: "Просмотры",
                        dataField: "views",
                        filter: numberFilter({placeholder: 'Введите значение'}),
                        sort: true
                    }
                    ,
                    {
                        text: "Репосты",
                        dataField: "reposts",
                        filter: numberFilter({placeholder: 'Введите значение'}),
                        sort: true
                    }
                    ,
                    {
                        text: "Аномальные просмотры",
                        dataField: "is_anomaly",
                        filter: selectFilter({
                            options: {
                                0: 'Да',
                                1: 'Нет'
                            },
                            placeholder: ' '
                        })
                    },
                    {
                        text: "Тональный характер",
                        dataField: "sentiment",
                        filter: selectFilter({
                            options: {
                                0: 'Позитивный',
                                1: 'Нейтральный',
                                2: 'Негативный'
                            },
                            placeholder: ' '
                        })
                    }
                ]
                this.setState({columns: columns, buttonDisable: this.isReady(), Chosen_SN: SN})
                break
            default:
                break
        }

    }

    isReady() {
        return !(this.state.Chosen_SN && this.state.from && this.state.to && this.state.sm_ids)
    }

    load_data() {
        const {Chosen_SN, sm_ids, from, to} = this.state
        const from_unix = from.getTime() / 1000
        const to_unix = to.getTime() / 1000

        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }

        this.setState({isLoading: true, SN: Chosen_SN})
        const url = 'https://kozinov.azurewebsites.net/api/statistics?restype=service&comp=propertiessocial_network=' +
            Chosen_SN + '&sm_id=' + sm_ids + '&start_date=' + from_unix + '&end_date=' + to_unix
        fetch(url)
            .then(res => res.json()
                .then(response => {
                    console.log("data is loaded", response)
                    let data = Object.values(response["response"]["posts"])
                    console.log("data is writen to variable")
                    let groups = data.map(post => post.group_name)
                    console.log("groups is writen to variable")
                    groups = groups.filter(onlyUnique)
                    groups = groups.map((group) => {
                        return {value: group, label: group}
                    })
                    this.setState({groups: groups, data: data})
                    console.log("writing state")
                }).then(() => this.setState({isLoading: false})))
    }

    handleInput(sm_ids) {
        this.setState({sm_ids: sm_ids, buttonDisable: this.isReady()})
    }

    showFromMonth() {
        const {from, to} = this.state;
        if (!from) {
            return;
        }
        if (moment(to).diff(moment(from), 'months') < 2) {
            this.to.getDayPicker().showMonth(from);
        }
    }

    handleFromChange(from) {
        // Change the from date and focus the "to" input field
        this.setState({from: from, buttonDisable: this.isReady()});
    }

    handleToChange(to) {
        this.setState({to: to, buttonDisable: this.isReady()}, this.showFromMonth);
    }

    render() {
        const {from, to, today, columns, data, buttonDisable, isLoading} = this.state;
        const modifiers = {start: from, end: to};


        return (
            <>
                <Navbar expand="lg" bg="dark" variant="dark">
                    <Navbar.Brand href="#home">
                        APP
                    </Navbar.Brand>
                </Navbar>
                <Container className='mt-4 mb-4'>
                    <Row className='ml-4 mr-4 mb-4'>

                        <Select options={[{value: 'vk', label: 'ВКонтакте'}, {
                            value: 'tg',
                            label: 'Телеграм'
                        }]}
                                style={{width: 150}}
                                onChange={val => this.handleSelect(val[0].value)}
                        />
                        <div className="InputFromTo ml-4">
                            <DayPickerInput
                                value={from}
                                placeholder="С"
                                format="LL"
                                formatDate={formatDate}
                                parseDate={parseDate}
                                dayPickerProps={{
                                    // eslint-disable-next-line
                                    selectedDays: [from, {from, to}],
                                    disabledDays: {after: today},
                                    toMonth: to,
                                    modifiers,
                                    numberOfMonths: 2,
                                    locale: 'ru',
                                    localeUtils: MomentLocaleUtils,
                                    onDayClick: () => this.to.getInput().focus(),
                                }}
                                onDayChange={this.handleFromChange}
                            />{' '}
                            —{' '}
                            <span className="InputFromTo-to">
                                    <DayPickerInput
                                        ref={el => (this.to = el)}
                                        value={to}
                                        placeholder="По"
                                        format="LL"
                                        formatDate={formatDate}
                                        parseDate={parseDate}
                                        dayPickerProps={{
                                            selectedDays: [from, {from, to}],
                                            disabledDays: {before: from, after: today},
                                            modifiers,
                                            month: from,
                                            fromMonth: from,
                                            numberOfMonths: 2,
                                            locale: 'ru',
                                            localeUtils: MomentLocaleUtils,
                                        }}
                                        onDayChange={this.handleToChange}
                                    />
                                    </span>
                            <Helmet>
                            </Helmet>
                        </div>

                    </Row>
                    <Row className='ml-4 mr-4 mb-4'>
                        <Form.Group controlId="exampleForm.ControlTextarea1">
                            <Form.Label>Введите ссылки на сети через запятую</Form.Label>
                            <Form.Control as="textarea" rows="3"
                                          onChange={event => this.handleInput(event.target.value)}
                            />
                        </Form.Group>
                    </Row>
                    <Row className='ml-4 mr-4 mb-4'>
                        <Button variant="primary" size="lg" block
                                disabled={buttonDisable || isLoading}
                                onClick={!isLoading && !buttonDisable ? this.load_data.bind(this) : undefined}>
                            {isLoading ? 'Загрузка...' : 'Загрузить данные'}
                        </Button>
                    </Row>
                    <Row className='ml-4 mr-4 mb-4'>
                        <BootstrapTable
                            data={data}
                            keyField="index"
                            expandRow={expandRow}
                            filter={filterFactory()}
                            pagination={paginationFactory()}
                            striped
                            condensed
                            // defaultSorted={ defaultSorted }
                            columns={columns}
                        />
                    </Row>
                </Container>
            </>
        );
    }
}

export default App;