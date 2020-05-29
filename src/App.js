import React, {Component} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    Container,
    Navbar,
    Row,
    Button,
    Tooltip,
    OverlayTrigger,
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
import DoubleScrollbar from 'react-double-scrollbar'

const version = '0.1.1'

const expandRow = {
    onlyOneExpanding: true,
    renderer: row => (
        <div>
            <p>Полный текст:</p>
            <p>{row.text}...</p>
        </div>
    )
};

function textSnippet(cell, row) {
    const text = row.text
    return (
        <div>
            <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Нажмите чтобы увидеть полный текст </Tooltip>}>
                <span>{text.slice(0, 100)}</span>
            </OverlayTrigger>
        </div>
    );
}

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
        console.log(version)
        this.handleFromChange = this.handleFromChange.bind(this);
        this.handleToChange = this.handleToChange.bind(this);
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
                        text: "Текст",
                        dataField: "text",
                        formatter: textSnippet,
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
                        // filter: selectFilter({
                        //     options: {
                        //         0: 'Да',
                        //         1: 'Нет'
                        //     },
                        //     placeholder: ' '
                        // })
                    },
                    {
                        text: "Тональный характер",
                        dataField: "sentiment",
                        // filter: selectFilter({
                        //     options: {
                        //         0: 'Позитивный',
                        //         1: 'Нейтральный',
                        //         2: 'Негативный'
                        //     },
                        //     placeholder: ' '
                        // })
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
                        formatter: textSnippet,
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
                        // filter: selectFilter({
                        //     options: {
                        //         0: 'Да',
                        //         1: 'Нет'
                        //     },
                        //     placeholder: ' '
                        // })
                    },
                    {
                        text: "Тональный характер",
                        dataField: "sentiment",
                        // filter: selectFilter({
                        //     options: {
                        //         0: 'Позитивный',
                        //         1: 'Нейтральный',
                        //         2: 'Негативный'
                        //     },
                        //     placeholder: ' '
                        // })
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
        try {
            const sm_ids_prepared = sm_ids.replace(/\s/g, '')
            const url = 'https://kozinov.azurewebsites.net/api/statistics?social_network=' +
                Chosen_SN + '&sm_id=' + sm_ids_prepared + '&start_date=' + from_unix + '&end_date=' + to_unix
            fetch(url)
                .then(res => res.json()
                    .then(response => {
                        //todo: exeptions handling
                        let data = Object.values(response["response"]["posts"])
                        let groups = data.map(post => post.group_name)
                        groups = groups.filter(onlyUnique)
                        groups = groups.map((group) => {
                            return {value: group, label: group}
                        })
                        console.log()
                        this.setState({groups: groups, data: data})
                    }).then(() => this.setState({isLoading: false})))
        } catch (e) {
            console.log(e)
            this.setState({isLoading: false})
        }
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

//todo: active columns select
//todo: export
//todo: graphs
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
                            <Form.Label>Введите ID сообществ через запятую, например, doxajournal,
                                thevyshka</Form.Label>
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
                    <DoubleScrollbar>

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
                    </DoubleScrollbar>
                </Container>
            </>
        );
    }
}

export default App;