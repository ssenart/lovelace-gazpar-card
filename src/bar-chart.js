import { LitElement, html, css } from 'lit';

// const LitElement = customElements.get("hui-masonry-view") ? Object.getPrototypeOf(customElements.get("hui-masonry-view")) : Object.getPrototypeOf(customElements.get("hui-view"));
// const html = LitElement.prototype.html;
// const css = LitElement.prototype.css;

import 'chart.js/dist/chart.min.js'

import './date-extensions.js';

import { Frequency } from './frequency.js';

//------------------------------------------------------------
const periodLengthByFrequency = new Map([
    [Frequency.Daily.toString(), 7],
    [Frequency.Weekly.toString(), 10],
    [Frequency.Monthly.toString(), 12],
    [Frequency.Yearly.toString(), 5],
]);
  
//------------------------------------------------------------
export class BarChart extends LitElement {

    //----------------------------------
    static get properties() { 
        return { 
            frequency: { type: Object },
            dataSet: { type: Array },
            periodName: { type: String },
            previousPeriodColor: { type: String },
            currentPeriodColor: { type: String },
            unit: { type: String },
            labelGetter: {},
            valueGetter: {},
        }
    };

    //----------------------------------
    constructor() {
        super();
        this.frequency = Frequency.Monthly;
        this.dataSet = []
        this.periodName = 'year';
        this.previousPeriodColor = 'lightgray';
        this.currentPeriodColor = 'gray';
        this.unit = 'kWh';
        this.labelGetter = x => x.time_period;
        this.valueGetter = x => x.energy_kwh;
    }

    //----------------------------------
    render() {

        console.log(`${this.frequency.toString()}.render()`)

        return html
        ` <div class="chart">    
            <canvas id="barChart"></canvas>
          </div>
        `
    }

    //----------------------------------
    static get styles() {
        return css`
        .chart {
            margin: auto;
            padding: 0.5em 0.5em 0.5em 0.5em;
            position: relative;
            cursor: pointer;
        }`;
    }

    //----------------------------------
    shouldUpdate(changedProperties) {
        console.log(`${this.frequency.toString()}.shouldUpdate(${JSON.stringify(changedProperties)})`)

        return true;
    }

    //----------------------------------
    firstUpdated() {
        console.log(`${this.frequency.toString()}.firstUpdated()`)
    }

    //----------------------------------
    updated(changedProperties) {

        console.log(`${this.frequency.toString()}.updated(${JSON.stringify(changedProperties)})`)

        const context = this.renderRoot.getElementById('barChart').getContext('2d');

        if (this.chart == null)
        {
            this.chart = new Chart(context, {
                
                data: {
                    labels: [],
                    datasets: [
                        {
                            type: 'bar',
                            label: `${this.unit} (last ${this.periodName})`,
                            data: [],
                            backgroundColor: [
                                this.previousPeriodColor,
                            ],
                            order: 2,
                            yAxisID: 'y',
                            
                        },
                        {
                            type: 'bar',
                            label: `${this.unit} (current ${this.periodName})`,
                            data: [],
                            backgroundColor: [
                                this.currentPeriodColor,
                            ],
                            order: 3,
                            yAxisID: 'y',
                        },
                    ],
                },
                options: {
                    scales: {
                        y: {
                        beginAtZero: true,
                        type: 'linear',
                        position: 'left',
                        grid: { display: false },
                        title: {
                            display: true,
                            text:this.unit
                        }
                        },
                    }
                }
            });

            if (this.frequency.toString() == Frequency.Daily.toString()) {
                this.chart.data.datasets.push(
                    {
                        type: 'line',
                        label: 'Temperature',
                        borderColor: 'red',
                        backgroundColor: 'red',
                        data: [],
                        order: 1,
                        yAxisID: 'temperature',
                    },
                );
                this.chart.options.scales.temperature = {
                    beginAtZero: true,
                    type: 'linear',
                    position: 'right',
                    grid: { display: false },
                    title: {
                      display: true,
                      text:'Temperature (°C)'
                    }
                };
            }
        }

        if (this.dataSet != null && this.dataSet.length > 0)
        {
            this.updateChartLabels();
            if (this.frequency.toString() != Frequency.Yearly.toString()) {
                this.updateBarChartData(0);
                if (this.frequency.toString() == Frequency.Daily.toString()) {
                    this.updateLineChartData(2);
                }
            }
            this.updateBarChartData(1);
            if (this.frequency.toString() == Frequency.Daily.toString()) {
                this.updateLineChartData(2);
            }
            if (this.frequency.toString() == Frequency.Yearly.toString()) {
                this.chart.data.datasets.shift();                
            }            
        }

        this.chart.update();

        window.addEventListener('resize', () => {
            if (this.chart) {
                this.chart.resize();
            }
        });
    }

    //----------------------------------
    updateChartLabels()
    {
        this.chart.data.labels = this.dataSet.slice(0, periodLengthByFrequency.get(this.frequency.toString())).reverse().map(this.labelGetter);
    }

    //----------------------------------
    updateBarChartData(index)
    {
        this.chart.data.datasets[index].data = this.dataSet.slice((1 - index) * periodLengthByFrequency.get(this.frequency.toString()), (2 - index) * periodLengthByFrequency.get(this.frequency.toString())).reverse().map(this.valueGetter);
    }

    //----------------------------------
    updateLineChartData(index)
    {
        this.chart.data.datasets[index].data = this.dataSet.slice(0, periodLengthByFrequency.get(this.frequency.toString())).reverse().map(x => x.temperature_degC);
    }
}

customElements.define('bar-chart', BarChart);
