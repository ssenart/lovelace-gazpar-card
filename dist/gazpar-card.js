import "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"

const minimumRequiredGazparIntegrationVersion="1.3.0"

const LitElement = Object.getPrototypeOf(
  customElements.get("ha-panel-lovelace")
);
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

const monthNumberByName = {
  'Janvier': 1,
  'Février': 2,
  'Mars': 3,
  'Avril': 4,
  'Mai': 5,
  'Juin': 6,
  'Juillet': 7,
  'Août': 8,
  'Septembre': 9,
  'Octobre': 10,
  'Novembre': 11,
  'Décembre': 12,
}

const monthNameByNumber = {
  1: 'Janvier',
  2: 'Février',
  3: 'Mars',
  4: 'Avril',
  5: 'Mai',
  6: 'Juin',
  7: 'Juillet',
  8: 'Août',
  9: 'Septembre',
  10: 'Octobre',
  11: 'Novembre',
  12: 'Décembre',
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "gazpar-card",
  name: "Gazpar card",
  description: "Gazpar lovelace card for Home Assistant. It works with integration home-assistant-gazpar.",
  preview: true,
  documentationURL: "https://github.com/ssenart/home-assistant-gazpar-card",
});

const fireEvent = (node, type, detail, options) => {
  options = options || {};
  detail = detail === null || detail === undefined ? {} : detail;
  const event = new Event(type, {
    bubbles: options.bubbles === undefined ? true : options.bubbles,
    cancelable: Boolean(options.cancelable),
    composed: options.composed === undefined ? true : options.composed,
  });
  event.detail = detail;
  node.dispatchEvent(event);
  return event;
};

function hasConfigOrEntityChanged(element, changedProps) {
  if (changedProps.has("config")) {
    return true;
  }

  const oldHass = changedProps.get("hass");
  if (oldHass) {
    return (
      oldHass.states[element.config.entity] !==
        element.hass.states[element.config.entity]
    );
  }

  return true;
}

class GazparCard extends LitElement {

  static get properties() {
    return {
      config: {},
      hass: {}
    };
  }

  static async getConfigElement() {
    await import("./gazpar-card-editor.js");
    return document.createElement("gazpar-card-editor");
  }

  updated(changedProperties) {

    const stateObj = this.hass.states[this.config.entity];

    if (stateObj)
    {
      const attributes = stateObj.attributes;
      
      this.updateMonthlyEnergyChart(attributes.monthly, this.config)
      this.updateMonthlyCostChart(attributes.monthly, this.config)

      this.updateYearlyEnergyChart(attributes.yearly, this.config)
      this.updateYearlyCostChart(attributes.yearly, this.config)
    }
  }

  updateMonthlyEnergyChart(data) {

    if (this.config.showMonthlyEnergyHistoryChart) {

      const ctx = this.renderRoot.querySelector('#monthlyEnergyHistoryChart').getContext('2d');

      this.monthlyEnergyHistoryChart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: [],
              datasets: [
                {
                  label: 'kWh (last year)',
                  data: [],
                  backgroundColor: [
                    'grey',
                  ],
                },
                {
                  label: 'kWh (current year)',
                  data: [],
                  backgroundColor: [
                      'orange',
                  ],
                }
              ]
          }
      });

      if (data != null && data.length > 0)
      {
        this.updateMonthlyChartLabels(this.monthlyEnergyHistoryChart, data)
        this.updateMonthlyEnergyChartData(this.monthlyEnergyHistoryChart, data, 0)
        this.updateMonthlyEnergyChartData(this.monthlyEnergyHistoryChart, data, 1)
      }

      this.monthlyEnergyHistoryChart.update()
    }
  }

  updateMonthlyCostChart(data) {

    if (this.config.showMonthlyCostHistoryChart) {

      const ctx = this.renderRoot.querySelector('#monthlyCostHistoryChart').getContext('2d');

      this.monthlyCostHistoryChart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: [],
              datasets: [
                {
                  label: '€ (last year)',
                  data: [],
                  backgroundColor: [
                    'grey',
                  ],              
                },
                {
                  label: '€ (current year)',
                  data: [],
                  backgroundColor: [
                      'DarkTurquoise',
                  ],
                }
              ]
          }
      });

      if (data != null && data.length > 0)
      {
      this.updateMonthlyChartLabels(this.monthlyCostHistoryChart, data)
      this.updateMonthlyCostChartData(this.monthlyCostHistoryChart, data, 0)
      this.updateMonthlyCostChartData(this.monthlyCostHistoryChart, data, 1)
      }

      this.monthlyCostHistoryChart.update()
    }
  }

  updateMonthlyChartLabels(chart, data)
  {  
    var lastYear = data.slice(0, 12).reverse()

    var labels = []
    for(var i in lastYear)
    {
      var date = this.parseMonthPeriod(lastYear[i].time_period)

      var label = date.toLocaleDateString('fr-FR', {month: 'short'})

      labels.push(label)
    }

    chart.data.labels = labels
  }

  updateMonthlyEnergyChartData(chart, data, index)
  {
    chart.data.datasets[index].data = data.slice((1 - index) * 12, (2 - index) * 12).reverse().map(item => item.energy_kwh)
  }

  updateMonthlyCostChartData(chart, data, index)
  {
    chart.data.datasets[index].data = data.slice((1 - index) * 12, (2 - index) * 12).reverse().map(item => this.toFloat(item.energy_kwh * this.config.pricePerKWh, 0))
  }

  updateYearlyEnergyChart(data) {

    if (this.config.showYearlyEnergyHistoryChart) {

      const ctx = this.renderRoot.querySelector('#yearlyEnergyHistoryChart').getContext('2d');

      this.yearlyEnergyHistoryChart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: [],
              datasets: [
                {
                  label: 'kWh (per year)',
                  data: [],
                  backgroundColor: [
                    'orange',
                  ],
                }
              ]
          }
      });

      if (data != null && data.length > 0)
      {
        this.updateYearlyChartLabels(this.yearlyEnergyHistoryChart, data)
        this.updateYearlyEnergyChartData(this.yearlyEnergyHistoryChart, data)
      }

      this.yearlyEnergyHistoryChart.update()
    }
  }

  updateYearlyCostChart(data) {

    if (this.config.showYearlyCostHistoryChart) {

      const ctx = this.renderRoot.querySelector('#yearlyCostHistoryChart').getContext('2d');

      this.yearlyCostHistoryChart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: [],
              datasets: [
                {
                  label: '€ (per year)',
                  data: [],
                  backgroundColor: [
                    'DarkTurquoise',
                  ],
                }
              ]
          }
      });

      if (data != null && data.length > 0)
      {
        this.updateYearlyChartLabels(this.yearlyCostHistoryChart, data)
        this.updateYearlyCostChartData(this.yearlyCostHistoryChart, data)
      }

      this.yearlyEnergyHistoryChart.update()
    }
  }

  updateYearlyChartLabels(chart, data)
  {  
    chart.data.labels = data.slice(0, 10).reverse().map(item => item.time_period)
  }

  updateYearlyEnergyChartData(chart, data)
  {
    chart.data.datasets[0].data = data.slice(0,10).reverse().map(item => item.energy_kwh)
  }

  updateYearlyCostChartData(chart, data)
  {
    chart.data.datasets[0].data = data.slice(0,10).reverse().map(item => this.toFloat(item.energy_kwh * this.config.pricePerKWh, 0))
  }

  render() {
    if (!this.config || !this.hass) {
      return html``;
    }

    const stateObj = this.hass.states[this.config.entity];

    if (!stateObj) {
      return html`
        <ha-card>
          <div class="card">
            <div id="states">
              <div class="name">
                <ha-icon id="icon" icon="mdi:flash" data-state="unavailable" data-domain="connection" style="color: var(--state-icon-unavailable-color)"></ha-icon>
                <span style="margin-right:2em">Gazpar: unavailable data for ${this.config.entity}</span>
              </div>
            </div>
          </div>
        </ha-card> 
      `
    } else {

      const attributes = stateObj.attributes;

      if (attributes.version == null || attributes.version < minimumRequiredGazparIntegrationVersion)
      {
        return html`
          <ha-card>
            <div class="card">
              <div id="states">
                <div class="name">
                  ${this.renderError([`The minimum required version of Gazpar Integration is ${minimumRequiredGazparIntegrationVersion}. Your current Gazpar Integration version is ${attributes.version}. Please update your Gazpar Integration version at least to version ${minimumRequiredGazparIntegrationVersion}.`])}
                </div>
              </div>
            </div>
          </ha-card> 
        `
      }

      // ****************************************************
      // for (var i = 0; i < attributes.daily.length; ++i)
      // {
      //   attributes.daily[i].energy_kwh = 0;
      // }

      // attributes.daily = attributes.daily.splice(0, 9)
      // attributes.monthly = attributes.monthly.splice(0, 14)
      // ****************************************************


      attributes.daily = this.rightPaddingDailyArray(attributes.daily, 14 - attributes.daily.length)
      attributes.monthly = this.rightPaddingMonthlyArray(attributes.monthly, 24 - attributes.monthly.length)

      this.computeConsumptionTrendRatio(attributes.daily, 7)
      this.computeConsumptionTrendRatio(attributes.monthly, 12)

      return html`
        <ha-card id="card">
          ${this.addEventListener('click', event => { this._showDetails(this.config.entity); })}
          ${this.renderTitle(this.config)}
          <div class="card">
            <div class="main-info">
              ${this.config.showIcon
                ? html`
                  <div class="icon-block">
                    <span class="gazpar-icon bigger" style="background: none, url(/local/community/lovelace-gazpar-card/gazpar-icon.png) no-repeat; background-size: contain;"></span>
                  </div>`
                : html `` 
              }
              <div class="cout-block">
                <span class="cout">${attributes.daily != null && attributes.daily.length > 0 ? this.toFloat(attributes.daily[0].energy_kwh):"N/A"}</span><span class="cout-unit">${attributes.unit_of_measurement}</span><br/>
                <span class="conso">${attributes.daily != null && attributes.daily.length > 0 ? this.toFloat(attributes.daily[0].volume_m3):"N/A"}</span><span class="conso-unit">m³</span> - 
                <span class="conso">${attributes.daily != null && attributes.daily.length > 0 ? attributes.daily[0].time_period:"N/A"}</span>
              </div>
              ${this.config.showCost 
                ? html `
                <div class="cout-block">
                  <span class="cout" title="Coût journalier">${attributes.daily != null && attributes.daily.length > 0 ? this.toFloat(attributes.daily[0].energy_kwh * this.config.pricePerKWh, 2):"N/A"}</span><span class="cout-unit"> €</span>
                </div>`
                : html ``
                }
            </div>
            
            ${this.renderDailyHistory(attributes.daily, attributes.unit_of_measurement, this.config)}
            ${this.renderMonthlyHistoryTable(attributes.monthly, attributes.unit_of_measurement, this.config)}

            ${this.renderMonthlyEnergyHistoryChart(attributes.monthly, attributes.unit_of_measurement, this.config)}
            ${this.renderMonthlyCostHistoryChart(attributes.monthly, attributes.unit_of_measurement, this.config)}

            ${this.renderYearlyEnergyHistoryChart(attributes.yearly, attributes.unit_of_measurement, this.config)}
            ${this.renderYearlyCostHistoryChart(attributes.yearly, attributes.unit_of_measurement, this.config)}

            ${this.renderError(attributes.errorMessages)}
            ${this.renderVersion(attributes.versionUpdateAvailable, attributes.versionGit)}
          </div>
        </ha-card>`
    }
  }

  rightPaddingDailyArray(data, size) {

    var time_period = this.parseDate(data[data.length-1].time_period)

    for (var i = 0; i < size; ++i)
    {
      time_period = this.addDays(time_period, -1)
      data.push({ time_period: this.formatDate(time_period), volume_m3: null, energy_kwh: null })
    }

    return data
  }

  rightPaddingMonthlyArray(data, size) {

    var time_period = this.parseMonthPeriod(data[data.length-1].time_period)

    for (var i = 0; i < size; ++i)
    {
      time_period = this.addMonths(time_period, -1)
      data.push({ time_period: this.formatMonth(time_period), volume_m3: null, energy_kwh: null })
    }

    return data
  }

  computeConsumptionTrendRatio(data, shift)
  {
    if (data != null)
    {
      for (var i = 0; i < data.length-shift; ++i)
      {
        if (data[i].energy_kwh != null && data[i].energy_kwh > 0 && data[i+shift].energy_kwh != null && data[i+shift].energy_kwh >= 0)
        {
          var ratio = 100 * (data[i].energy_kwh - data[i+shift].energy_kwh) / data[i].energy_kwh

          data[i].ratio = ratio
        }
        else
        {
          data[i].ratio = null
        }
      }
    }
  }

  _showDetails(myEntity) {
    const event = new Event('hass-more-info', {
      bubbles: true,
      cancelable: false,
      composed: true
    });
    event.detail = {
      entityId: myEntity
    };
    this.dispatchEvent(event);
    return event;
  }

  renderTitle(config) {
    if (this.config.showTitle === true) {
      return html
        `
          <div class="card">
          <div class="main-title">
          <span>${this.config.title}</span>
          </div>
          </div>` 
       }
  }

  renderError(errorMsg) {
    if (this.config.showError === true) {
       if (errorMsg.length > 0){
          return html
            `
              <div class="error-msg" style="color: red">
                <ha-icon id="icon" icon="mdi:alert-outline"></ha-icon>
                ${errorMsg.join("<br>")}
              </div>
            `
       }
    }
  }

  renderVersion(versionUpdateAvailable, versionGit) {
    if ( versionUpdateAvailable === true ){
          return html
            `
              <div class="information-msg" style="color: red">
                <ha-icon id="icon" icon="mdi:alert-outline"></ha-icon>
                Nouvelle version disponible ${versionGit}
              </div>
            `
    }
    else{
       return html ``
    }
  }

  parseDate(dateStr) {

    var parts = dateStr.split("/")
    var res = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10))

    return res;
  }

  parseMonthPeriod(monthPeriodStr) {

    var parts = monthPeriodStr.split(" ")

    var res = new Date(parseInt(parts[1], 10), monthNumberByName[parts[0]] - 1, 1)

    return res;
  }

  formatDate(date) {

    return date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear();
  }

  formatMonth(date)
  {
    return monthNameByNumber[date.getMonth() + 1] + " " + date.getFullYear();
  }

  addDays(date, days) {

    var res = new Date(date);
    res.setDate(res.getDate() + days);

    return res;
  }

  addMonths(date, months) {

    var res = new Date(date);
    res.setMonth(res.getMonth() + months);

    return res;
  }

  renderDailyHistory(data, unit_of_measurement, config) {

    if (config.showDailyHistory && data != null && data.length > 0) {
      // Keep the last 7 days.
      var now = new Date()
      var filteredDates = data.reverse().filter(item => this.parseDate(item.time_period) >= this.addDays(now, -8))

      // Fill with last days of unavailable data.
      var missingDate = this.addDays(this.parseDate(filteredDates[filteredDates.length - 1].time_period), 1)
      while (filteredDates.length < 7)
      {
        filteredDates.push({time_period: this.formatDate(missingDate), volume_m3: null, energy_kwh: null })

        missingDate = this.addDays(missingDate, 1)
      }

      return html
      `
        <hr size="1" color="grey"/>
        <div class="week-history">
          ${this.renderHistoryHeader(config)}
          ${filteredDates.slice(filteredDates.length - 7, filteredDates.length).map(item => this.renderDailyDataColumnHistory(item, unit_of_measurement, config))}
        </div>
      `
    }
  }

  renderMonthlyHistoryTable(data, unit_of_measurement, config) {

    if (config.showMonthlyHistory && data != null && data.length > 0) {
      return html
      `
        <hr size="1" color="grey"/>
        <div class="week-history">
          ${this.renderHistoryHeader(config)}
          ${data.slice(0, 12).reverse().map(item => this.renderMonthlyDataColumnHistory(item, unit_of_measurement, config))}
        </div>
      `
    }
  }

  renderMonthlyEnergyHistoryChart() {

    if (this.config.showMonthlyEnergyHistoryChart)
    {
      return html
      `
        <hr size="1" color="grey"/>
        <div class="chart-container">
          <canvas id="monthlyEnergyHistoryChart"></canvas>
        </div>
      `
    } else {
      return html
      `
      `
    }
  }

  renderMonthlyCostHistoryChart() {

    if (this.config.showMonthlyCostHistoryChart)
    {
      return html
      `
        <hr size="1" color="grey"/>
        <div class="chart-container">
          <canvas id="monthlyCostHistoryChart"></canvas>
        </div>
      `
    } else {
      return html
      `
      `
    }
  }

  renderYearlyEnergyHistoryChart() {

    if (this.config.showYearlyEnergyHistoryChart)
    {
      return html
      `
        <hr size="1" color="grey"/>
        <div class="chart-container">
          <canvas id="yearlyEnergyHistoryChart"></canvas>
        </div>
      `
    } else {
      return html
      `
      `
    }
  }

  renderYearlyCostHistoryChart() {

    if (this.config.showYearlyCostHistoryChart)
    {
      return html
      `
        <hr size="1" color="grey"/>
        <div class="chart-container">
          <canvas id="yearlyCostHistoryChart"></canvas>
        </div>
      `
    } else {
      return html
      `
      `
    }
  }

  renderDailyDataColumnHistory(item, unit_of_measurement, config) {

      var date = this.parseDate(item.time_period)
      
      return html `
      <div class="day">
        <span class="dayname" title="${date.toLocaleDateString('fr-FR')}">${date.toLocaleDateString('fr-FR', {weekday: 'short'})}</span>
        ${config.showEnergyHistory ? this.renderDataValue(item.energy_kwh,  0) : ""}
        ${config.showVolumeHistory ? this.renderDataValue(item.volume_m3, 0) : ""}
        ${config.showCostHistory ? this.renderDataValue(item.energy_kwh != null ? item.energy_kwh * this.config.pricePerKWh:null, 2) : ""}
        ${config.showTrendRatioHistory ? this.renderRatioValue(item.ratio, 0) : ""}
      </div>
      `
  }

  renderMonthlyDataColumnHistory(item, unit_of_measurement, config) {

    var date = this.parseMonthPeriod(item.time_period)
    
    return html `
    <div class="day">
      <span class="dayname" title="${date.toLocaleDateString('fr-FR', {month: 'long', year: 'numeric'})}">${date.toLocaleDateString('fr-FR', {month: 'narrow'})}</span>
      ${config.showEnergyHistory ? this.renderDataValue(item.energy_kwh, 0) : ""}
      ${config.showVolumeHistory ? this.renderDataValue(item.volume_m3, 0) : ""}
      ${config.showCostHistory ? this.renderDataValue(item.energy_kwh != null ? item.energy_kwh * this.config.pricePerKWh:null, 0) : ""}
      ${config.showTrendRatioHistory ? this.renderRatioValue(item.ratio, 0) : ""}
    </div>
    `
  }

  renderDataValue(value, decimals)
  {
    if (value != null && value >= 0) {
      return html `
        <br><span class="cons-val">${this.toFloat(value, decimals)}</span>
      `
    } else {
      return html `
        ${this.renderNoData()}
      `
    }
  }

  renderRatioValue(value, unit, decimals)
  {
    if (value != null)
    {
      return html `
      <br>
      <span class="ha-icon">
        <ha-icon icon="mdi:arrow-right" style="color: ${value > 0 ? "red":"green"}; display: inline-block; transform: rotate(${value < 0?'45': (value == 0? "0" : "-45")}deg)">
      </ha-icon>
      </span>
      <div class="tooltip">
        <nobr>${(value > 0) ? '+': ''}${Math.round(value)}<span class="unit">%</span></nobr>
      </div>`
    } else {
      return html `
        ${this.renderNoData()}
      `
    }
  }

  renderRowHeader(show, header) {

    if (show) {
       return html
       `${header}<br>
       `
      }
    else{
       return html
       `
       `
    }
  }

  renderHistoryHeader(config) {
    if (this.config.showHistoryHeader) {
       return html
       `
        <div class="day">
          ${this.renderRowHeader(true, "")}
          ${this.renderRowHeader(this.config.showEnergyHistory, "kWh")}
          ${this.renderRowHeader(this.config.showVolumeHistory, "m³")}
          ${this.renderRowHeader(this.config.showCostHistory, "€")}
          ${this.renderRowHeader(this.config.showTrendRatioHistory, "%")}
        </div>
        `
    }
  }

  renderNoData(){
    return html
    `
      <br><span class="cons-val" title="Donnée indisponible"><ha-icon id="icon" icon="mdi:alert-outline" style="color:orange"></ha-icon></span>
    `
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }

    if (config.pricePerKWh && isNaN(config.pricePerKWh)) {
      throw new Error('pricePerKWh should be a number')
    }
    
    const defaultConfig = {

      title: "GrDF data",
      entity: "sensor.gazpar",
      pricePerKWh: 0.0,

      showTitle: true,
      showIcon: true,
      showCost: true,

      showDailyHistory: true,
      showMonthlyHistory: true,
      showHistoryHeader: true,
      showEnergyHistory: true,
      showVolumeHistory: true,
      showCostHistory: true,
      showTrendRatioHistory: true,
      
      showMonthlyEnergyHistoryChart: true,
      showMonthlyCostHistoryChart: true,

      showYearlyEnergyHistoryChart: true,
      showYearlyCostHistoryChart: true,

      showError: true,
    }

    this.config = {
      ...defaultConfig,
      ...config
    };
  }

  shouldUpdate(changedProps) {
    return hasConfigOrEntityChanged(this, changedProps);
  }

  getCardSize() {
    return 3;
  }
 
  toFloat(value, decimals = 1) {
    return Number.parseFloat(value).toFixed(decimals);
  }
  
  static get styles() {
    return css`
      .card {
        margin: auto;
        padding: 1.5em 1em 1em 1em;
        position: relative;
        cursor: pointer;
      }

      .main-title {
        margin: auto;
        text-align: center;
        font-weight: 200;
        font-size: 2em;
        justify-content: space-between;
      }
      .main-info {
        display: flex;
        overflow: hidden;
        align-items: center;
        justify-content: space-between;
        height: 75px;
      }
    
      .ha-icon {
        margin-right: 5px;
        color: var(--paper-item-icon-color);
      }
      
      .cout-block {
      }
  
      .cout {
        font-weight: 300;
        font-size: 3.5em;
      }
    
      .cout-unit {
        font-weight: 300;
        font-size: 1.2em;
        display: inline-block;
      }
    
      .conso-hp, .conso-hc, .conso {
        font-weight: 200;
        font-size: 1em;
      }
    
      .conso-unit-hc, .conso-unit-hp, .conso-unit {
        font-weight: 100;
        font-size: 1em;
      }
      
      .more-unit {
        font-style: italic;
        font-size: 0.8em;
      }
    
      .variations {
        display: flex;
        justify-content: space-between;
        overflow: hidden;
      }

      .variations-linky {
        display: inline-block;
        font-weight: 300;
        margin: 1em;
        overflow: hidden;
      }
    
      .unit {
        font-size: .8em;
      }
    
      .week-history {
        display: flex;
        overflow: hidden;
      }
    
      .day {
        flex: auto;
        text-align: center;
        border-right: .1em solid var(--divider-color);
        line-height: 2;
        box-sizing: border-box;
      }
    
      .dayname {
        font-weight: bold;
        text-transform: capitalize;
      }
  
      .week-history .day:last-child {
        border-right: none;
      }
    
      .cons-val {
        //font-weight: bold;
      }
      
      .previous-month {
        font-size: 0.8em;
        font-style: italic;
        margin-left: 5px;
      }
      .current-month {
        font-size: 0.8em;
        font-style: italic;
        margin-left: 5px;
      }
      .icon-block {
      }
      .gazpar-icon.bigger {
        width: 6em;
        height: 5em;
        display: inline-block;
      }
      .error {
        font-size: 0.8em;
        font-style: bold;
        margin-left: 5px;
      }
      .tooltip .tooltiptext {
        visibility: hidden;
        background: var( --ha-card-background, var(--card-background-color, white) );
        box-shadow: 2px 2px 6px -4px #999;
        cursor: default;
        font-size: 14px;    
        opacity: 1;
        pointer-events: none;
        position: absolute;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 12;
        transition: 0.15s ease all;
        padding: 5px;
        border: 1px solid #cecece;
        border-radius: 3px;
      }
      .tooltip .tooltiptext::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: #555 transparent transparent transparent;
      }
      .tooltip:hover .tooltiptext {
        visibility: visible;
        opacity: 1;
      }
      `;
  }
}

customElements.define('gazpar-card', GazparCard);
