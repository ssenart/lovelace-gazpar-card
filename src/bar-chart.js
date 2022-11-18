import { LitElement, html, css } from 'lit';

import 'chart.js/dist/chart.min.js'

import './date-extensions.js';

import { Frequency } from './frequency.js';

//------------------------------------------------------------
const periodLengthByFrequency = new Map([
    [Frequency.Daily.toString(), 7],
    [Frequency.Weekly.toString(), 12],
    [Frequency.Monthly.toString(), 12],
    [Frequency.Yearly.toString(), 5],
]);
  
//------------------------------------------------------------
export class BarChart extends LitElement {

    //----------------------------------
    static properties = {
        frequency: {},
        dataSet: {},
        periodName: {},
        previousPeriodColor: {},
        currentPeriodColor: {},
        unit: {},
        valueGetter: {},
    };

    //----------------------------------
    constructor() {
        super();
        this.frequency = Frequency.Monthly;
        this.periodName = 'year';
        this.previousPeriodColor = 'lightgray';
        this.currentPeriodColor = 'gray';
        this.unit = 'kWh';
        this.labelGetter = x => x.time_period;
        this.valueGetter = x => x.energy_kwh;
    }

    //----------------------------------
    render() {
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
    updated() {
        const context = this.renderRoot.getElementById('barChart').getContext('2d');

        if (this.chart != null) {
            this.chart.destroy();
        }

        this.chart = new Chart(context, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                    label: `${this.unit} (last ${this.periodName})`,
                    data: [],
                    backgroundColor: [
                        this.previousPeriodColor,
                    ],
                    },
                    {
                    label: `${this.unit} (current ${this.periodName})`,
                    data: [],
                    backgroundColor: [
                        this.currentPeriodColor,
                    ],
                    }
                ]
            }
        });

        if (this.dataSet != null && this.dataSet.length > 0)
        {
            this.updateChartLabels();
            if (this.frequency.toString() != Frequency.Yearly.toString()) {
                this.updateChartData(0);
            }
            this.updateChartData(1);
            if (this.frequency.toString() == Frequency.Yearly.toString()) {
                this.chart.data.datasets.shift();
            }            
        }

        this.chart.update();
    }

    //----------------------------------
    updateChartLabels()
    {
        this.chart.data.labels = this.dataSet.slice(0, periodLengthByFrequency.get(this.frequency.toString())).reverse().map(this.labelGetter);
    }

    //----------------------------------
    updateChartData(index)
    {
        this.chart.data.datasets[index].data = this.dataSet.slice((1 - index) * periodLengthByFrequency.get(this.frequency.toString()), (2 - index) * periodLengthByFrequency.get(this.frequency.toString())).reverse().map(this.valueGetter);
    }
}

customElements.define('bar-chart', BarChart);
