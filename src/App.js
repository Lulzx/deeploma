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
import createPlotlyComponent from 'react-plotly.js/factory';
import {CSVLink} from "react-csv";

const Plotly = window.Plotly;
const Plot = createPlotlyComponent(Plotly);

const version = '0.1.6'
const LOCALHOST = "http://127.0.0.1:5000"
const WEBSERVER = "https://kozinov.azurewebsites.net"

const expandRow = {
    onlyOneExpanding: true,
    renderer: row => (
        <div>
            <p>Полный текст:</p>
            <p>{row.text}...</p>
        </div>
    )
};

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function prepareDataForChart(data, groups) {
    let posts_by_group = {}
    groups.map(group => {
        posts_by_group[group] = data.filter(post => {
            return post.group_name === group
        })
        return group
    })
    let metrics = []
    for (let [group, timeArray] of Object.entries(posts_by_group)) {
        let object = {}
        timeArray.map(function (post) {
            let date = post.post_date;
            let localDateString = new Date(date).getFullYear() + '-' + (new Date(date).getMonth() + 1) + '-' + new Date(date).getDate();
            if (object[localDateString]) {
                object[localDateString].count += 1;
                object[localDateString].views += post.views;
            } else {
                object[localDateString] = {views: post.views, count: 1}
            }
            return post
        })

        let x = []
        let y = []
        for (let [key, value] of Object.entries(object)) {
            x.push(new Date(key))
            y.push(value.views / value.count)
        }
        metrics.push({"name": group, "x": x, "y": y, "type": 'scatter', "line": {"shape": 'spline'}})
    }
    return metrics
}

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
        groups_filter: [],
        data: [],
        sm_ids: [],
        columns: [{
            text: "Тут будут посты"
        }],
        from: undefined,
        to: undefined,
        buttonDisable: true,
        isLoading: false,
        timeplot_data: []
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
                            options: this.state.groups_filter,
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
                            options: [{value: "Да", label: "Да"}, {value: "Нет", label: "Нет"}],
                            placeholder: ' '
                        }),
                        sort: true
                    },
                    {
                        text: "Тональный характер",
                        dataField: "sentiment",
                        filter: selectFilter({
                            options: [{value: "Позитивный", label: "Позитивный"},
                                {value: "Нейтральный", label: "Нейтральный"},
                                {value: "Негативный", label: "Негативный"}],
                            placeholder: ' '
                        }),
                        sort: true
                    }
                ]
                this.setState({columns: columns, Chosen_SN: SN})
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
                        filter: selectFilter({
                            options: [{value: "Да", label: "Да"}, {value: "Нет", label: "Нет"}],
                            placeholder: ' '
                        }),
                        sort: true,
                        placeholder: ' '
                    },
                    {
                        text: "Тональный характер",
                        dataField: "sentiment",
                        filter: selectFilter({
                            options: [{value: "Позитивный", label: "Позитивный"},
                                {value: "Нейтральный", label: "Нейтральный"},
                                {value: "Негативный", label: "Негативный"}],
                            placeholder: ' '
                        }),
                        sort: true
                    }
                ]
                this.setState({columns: columns, Chosen_SN: SN})
                break
            default:
                break
        }
        this.setState({buttonDisable: this.isReady()})
    }

    isReady() {
        return !(this.state.Chosen_SN && this.state.from && this.state.to && this.state.sm_ids)
    }

    load_data() {
        const {Chosen_SN, sm_ids, from, to} = this.state
        const from_unix = from.getTime() / 1000
        const to_unix = to.getTime() / 1000

        this.setState({
            isLoading: true,
            SN: Chosen_SN,
            data: this.initial_state.data,
            groups: this.initial_state.groups,
            groups_filter: this.initial_state.groups_filter,
            timeplot_data: this.initial_state.timeplot_data
        })
        const sm_ids_prepared = sm_ids.replace(/\s/g, '')
        const sm_ids_arr = sm_ids_prepared.split(',')
        const len = sm_ids_arr.length
        let counter = 0
        let isLoading = true
        sm_ids_arr.map(function (sm) {
            counter += 1;
            const url = WEBSERVER + '/api/statistics?social_network=' +
                Chosen_SN + '&sm_id=' + sm + '&start_date=' + from_unix + '&end_date=' + to_unix
            fetch(url)
                .then(res => res.json()
                    .then(response => {
                            if (response["error"] !== '')
                                console.log('error on response', response["error"])
                            if (response["response"]["count"] !== 0) {
                                let data = Object.values(response["response"]["posts"])
                                let groups = data.map(post => post.group_name)
                                groups.push(groups.filter(onlyUnique))
                                let groups_filter = groups.map(group => {
                                    return {'value': group, 'label': group}
                                })
                                let timeplot_data = prepareDataForChart(data, groups)
                                if (counter === len)
                                    isLoading = false
                                this.setState(prevState => ({
                                    data: [...prevState.data, data],
                                    groups: [...prevState.groups, groups],
                                    groups_filter: [...prevState.groups_filter, groups_filter],
                                    timeplot_data: [...prevState.timeplot_data, timeplot_data],
                                    isLoading: isLoading
                                }))


                            }
                        }
                    )
                ).catch((error) => {
                console.log("Ошибка при парсинге ответа", error)
            })
        }).catch((error) => {
                console.log("Ошибка при запросе", error)
                this.setState({isLoading: false})
            }
        )
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
    render() {
        const {from, to, today, columns, data, buttonDisable, isLoading} = this.state;
        const modifiers = {start: from, end: to};

        return (
            <>
                <Navbar expand="lg" bg="dark" variant="dark">
                    <Navbar.Brand href="#home">
                        Программа определения тональности постов в социальных сетях и сбора статистики
                    </Navbar.Brand>
                </Navbar>
                <Container className='mt-4 mb-4'>
                    <Row className='ml-4 mr-4 mb-4'>

                        <Select options={[
                            {
                                value: 'vk',
                                label: 'ВКонтакте'
                            }, {
                                value: 'tg',
                                label: 'Телеграм'
                            }]}
                                style={{width: 150}}
                                onChange={val =>
                                    this.handleSelect(val[0].value)}
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
                    <CSVLink className='btn btn-info'
                             data={data}
                             separator={";"}
                             filename={"posts.csv"}
                    >
                        Скачать CSV</CSVLink>

                    <DoubleScrollbar>
                        <BootstrapTable
                            striped
                            condensed
                            data={data}
                            keyField="index"
                            columns={columns}
                            expandRow={expandRow}
                            filter={filterFactory()}
                            pagination={paginationFactory()}
                        />
                    </DoubleScrollbar>
                    <Plot
                        data={this.state.timeplot_data}
                        layout={{
                            width: 1000,
                            height: 600,
                            title: 'Среднее количество просмотров постов, сделанных в указанный день',
                            xaxis: {
                                dtick: 86400000,
                                title: 'Даты',
                                type: 'date',
                                tickformat: '%d/%m'
                            },
                            yaxis: {
                                title: 'Средние просмотры у одного поста'
                            }

                        }}

                    />
                </Container>
            </>
        )
            ;
    }
}

export default App;