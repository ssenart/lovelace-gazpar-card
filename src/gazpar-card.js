import 'chart.js/dist/chart.min.js'

import { LitElement, html, css } from 'lit';

// const LitElement = customElements.get("hui-masonry-view") ? Object.getPrototypeOf(customElements.get("hui-masonry-view")) : Object.getPrototypeOf(customElements.get("hui-view"));
// const html = LitElement.prototype.html;
// const css = LitElement.prototype.css;

import GazparIcon from '../images/gazpar-icon.png'
import './date-extensions.js';
import { Frequency } from '../src/frequency.js';

//------------------------------------------------------
window.customCards = window.customCards || [];
window.customCards.push({
  type: "gazpar-card",
  name: "Gazpar card",
  description: "Gazpar lovelace card for Home Assistant. It works with integration home-assistant-gazpar.",
  preview: true,
  documentationURL: "https://github.com/ssenart/home-assistant-gazpar-card",
});

//------------------------------------------------------
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

//------------------------------------------------------
export class GazparCard extends LitElement {

  //----------------------------------
  static get properties() {
    return {
      config: {},
      hass: {}
    };
  }

  //----------------------------------
  static async getConfigElement() {
    await import("./gazpar-card-editor.js");
    return document.createElement("gazpar-card-editor");
  }

  //----------------------------------
  updated(changedProperties) {

    if (this.hass && this.config)
    {
      const stateObj = this.hass?.states[this.config.entity];

      if (stateObj)
      {
        const attributes = stateObj.attributes;

        // Shallow copy of monthly and yearly data.
        var daily = Array.from(attributes.daily);
        var weekly = Array.from(attributes.weekly);
        var monthly = Array.from(attributes.monthly);
        var yearly = Array.from(attributes.yearly);

        // Sort data descending by time_period.
        daily = this.sortDescDailyData(daily)
        weekly = this.sortDescWeeklyData(weekly)
        monthly = this.sortDescMonthlyData(monthly)

        // Add "empty" to have a full array.
        daily = GazparCard.rightPaddingDailyArray(daily, 14 - daily.length)
        weekly = GazparCard.rightPaddingWeeklyArray(weekly, 24 - weekly.length)
        monthly = GazparCard.rightPaddingMonthlyArray(monthly, 24 - monthly.length)
        
        this.updateDailyEnergyChart(daily, this.config)
        this.updateDailyCostChart(daily, this.config)

        this.updateWeeklyEnergyChart(weekly, this.config)
        this.updateWeeklyCostChart(weekly, this.config)

        this.updateMonthlyEnergyChart(monthly, this.config)
        this.updateMonthlyCostChart(monthly, this.config)

        this.updateYearlyEnergyChart(yearly, this.config)
        this.updateYearlyCostChart(yearly, this.config)
      }
    }
  }

  //----------------------------------
  updateDailyEnergyChart(dataSet) {

    if (this.config.showDailyEnergyHistoryChart) {
      var card = this.renderRoot.getElementById('dailyEnergyChart');

      card.frequency = Frequency.Daily;
      card.dataSet = dataSet;
      card.periodName = 'week';
      card.previousPeriodColor = 'gray';
      card.currentPeriodColor = 'orange';
      card.unit = 'kWh';
      card.labelGetter = x => GazparCard.formatDayOfWeek(x.time_period);
      card.valueGetter = x => x.energy_kwh;
    }
  }

  //----------------------------------
  updateDailyCostChart(dataSet) {

    if (this.config.showDailyCostHistoryChart) {
      var card = this.renderRoot.getElementById('dailyCostChart');

      card.frequency = Frequency.Daily;
      card.dataSet = dataSet;
      card.periodName = 'week';
      card.previousPeriodColor = 'gray';
      card.currentPeriodColor = 'DarkTurquoise';
      card.unit = '€';
      card.labelGetter = x => GazparCard.formatDayOfWeek(x.time_period);
      card.valueGetter = x => Number.parseFloat(x.energy_kwh * this.config.pricePerKWh).toFixed(1); 
    }
  }

  //----------------------------------
  updateWeeklyEnergyChart(dataSet) {

    if (this.config.showWeeklyEnergyHistoryChart) {
      var card = this.renderRoot.getElementById('weeklyEnergyChart');

      card.frequency = Frequency.Weekly;
      card.dataSet = dataSet;
      card.periodName = 'year';
      card.previousPeriodColor = 'gray';
      card.currentPeriodColor = 'orange';
      card.unit = 'kWh';
      card.labelGetter = x => GazparCard.formatWeek(x.time_period);
      card.valueGetter = x => x.energy_kwh;      
    }
  }

  //----------------------------------
  updateWeeklyCostChart(dataSet) {

    if (this.config.showWeeklyCostHistoryChart) {
      var card = this.renderRoot.getElementById('weeklyCostChart');

      card.frequency = Frequency.Weekly;
      card.dataSet = dataSet;
      card.periodName = 'year';
      card.previousPeriodColor = 'gray';
      card.currentPeriodColor = 'DarkTurquoise';
      card.unit = '€';
      card.labelGetter = x => GazparCard.formatWeek(x.time_period);
      card.valueGetter = x => Number.parseFloat(x.energy_kwh * this.config.pricePerKWh).toFixed(1); 
    }
  }

  //----------------------------------
  updateMonthlyEnergyChart(dataSet) {

    if (this.config.showMonthlyEnergyHistoryChart) {
      var card = this.renderRoot.getElementById('monthlyEnergyChart');

      card.frequency = Frequency.Monthly;
      card.dataSet = dataSet;
      card.periodName = 'year';
      card.previousPeriodColor = 'gray';
      card.currentPeriodColor = 'orange';
      card.unit = 'kWh';
      card.labelGetter = x => GazparCard.formatMonth(x.time_period);
      card.valueGetter = x => x.energy_kwh;      
    }
  }

  //----------------------------------
  updateMonthlyCostChart(dataSet) {

    if (this.config.showMonthlyCostHistoryChart) {
      var card = this.renderRoot.getElementById('monthlyCostChart');

      card.frequency = Frequency.Monthly;
      card.dataSet = dataSet;
      card.periodName = 'year';
      card.previousPeriodColor = 'gray';
      card.currentPeriodColor = 'DarkTurquoise';
      card.unit = '€';
      card.labelGetter = x => GazparCard.formatMonth(x.time_period);
      card.valueGetter = x => Number.parseFloat(x.energy_kwh * this.config.pricePerKWh).toFixed(1); 
    }
  }

  //----------------------------------
  updateYearlyEnergyChart(dataSet) {

    if (this.config.showYearlyEnergyHistoryChart) {
      var card = this.renderRoot.getElementById('yearlyEnergyChart');

      card.frequency = Frequency.Yearly;
      card.dataSet = dataSet;
      card.periodName = '3 years';
      card.previousPeriodColor = 'gray';
      card.currentPeriodColor = 'orange';
      card.unit = 'kWh';
      card.labelGetter = x => GazparCard.formatYear(x.time_period);
      card.valueGetter = x => x.energy_kwh;     
    }
  }

  //----------------------------------
  updateYearlyCostChart(dataSet) {

    if (this.config.showYearlyCostHistoryChart) {
      var card = this.renderRoot.getElementById('yearlyCostChart');

      card.frequency = Frequency.Yearly;
      card.dataSet = dataSet;
      card.periodName = '3 years';
      card.previousPeriodColor = 'gray';
      card.currentPeriodColor = 'DarkTurquoise';
      card.unit = '€';
      card.labelGetter = x => GazparCard.formatYear(x.time_period);
      card.valueGetter = x => Number.parseFloat(x.energy_kwh * this.config.pricePerKWh).toFixed(1); 
    }
  }

  //----------------------------------
  render() {
    if (!this.hass) {
      return html`Please define a hass attribute to the GazparCard component`;
    }

    if (!this.config) {
      return html`Please define a config attribute to the GazparCard component`;
    }

    const stateObj = this.hass.states[this.config.entity];

    if (!stateObj) {
      return html`
        <ha-card>
          <div class="section">
            <div id="states">
              <div>
                <ha-icon id="icon" icon="mdi:flash" data-state="unavailable" data-domain="connection" style="color: var(--state-icon-unavailable-color)"></ha-icon>
                <span style="margin-right:2em">Gazpar: unavailable data for ${this.config.entity}</span>
              </div>
            </div>
          </div>
        </ha-card> 
      `
    } else {

      const attributes = stateObj.attributes;

      if (attributes.version == null || compareVersions(attributes.version, COMPATIBLE_INTEGRATION_VERSION) < 0)
      {
        return html`
          <ha-card>
            <div class="section">
              <div id="states">
                <div>
                  ${this.renderError([`The minimum required version of Gazpar Integration is ${COMPATIBLE_INTEGRATION_VERSION}. Your current Gazpar Integration version is ${attributes.version}. Please update your Gazpar Integration version at least to version ${COMPATIBLE_INTEGRATION_VERSION}.`])}
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

      // Shallow copy of daily, weekly, monthly and yearly data.
      var daily = Array.from(attributes.daily);
      var weekly = Array.from(attributes.weekly);
      var monthly = Array.from(attributes.monthly);
      var yearly = Array.from(attributes.yearly);

      // Sort data descending by time_period.
      daily = this.sortDescDailyData(daily)
      weekly = this.sortDescWeeklyData(weekly)
      monthly = this.sortDescMonthlyData(monthly)

      // Add "empty" to have a full array (of 14 days or 24 months).
      daily = GazparCard.rightPaddingDailyArray(daily, 14 - daily.length)
      weekly = GazparCard.rightPaddingWeeklyArray(weekly, 20 - weekly.length)
      monthly = GazparCard.rightPaddingMonthlyArray(monthly, 24 - monthly.length)

      this.computeConsumptionTrendRatio(daily, 7)
      this.computeConsumptionTrendRatio(monthly, 12)

      return html`
        <ha-card>
          ${this.addEventListener('click', event => { this._showDetails(this.config.entity); })}

          ${this.renderTitle(this.config)}
           
          ${this.renderMainBar(daily, attributes.unit_of_measurement)}

          ${this.renderDailyHistory(daily, attributes.unit_of_measurement, this.config)}
          ${this.renderMonthlyHistoryTable(monthly, attributes.unit_of_measurement, this.config)}

          ${this.renderDailyEnergyHistoryChart()}
          ${this.renderDailyCostHistoryChart()}

          ${this.renderWeeklyEnergyHistoryChart()}
          ${this.renderWeeklyCostHistoryChart()}

          ${this.renderMonthlyEnergyHistoryChart()}
          ${this.renderMonthlyCostHistoryChart()}

          ${this.renderYearlyEnergyHistoryChart()}
          ${this.renderYearlyCostHistoryChart()}

          ${this.renderError(attributes.errorMessages)}
          ${this.renderVersion()}
        </ha-card>`
    }
  }

  //----------------------------------
  sortDescDailyData(dailyData)
  {
    return dailyData.sort((x, y) => Date.parseDate(y.time_period) - Date.parseDate(x.time_period))
  }

  //----------------------------------
  sortDescWeeklyData(weeklyData)
  {
    return weeklyData.sort((x, y) => Date.parseWeekPeriod(y.time_period) - Date.parseWeekPeriod(x.time_period))
  }

  //----------------------------------
  sortDescMonthlyData(monthlyData)
  {
    return monthlyData.sort((x, y) => Date.parseMonthPeriod(y.time_period) - Date.parseMonthPeriod(x.time_period))
  }

  //----------------------------------
  static rightPaddingDailyArray(data, size) {

    var time_period = Date.today();
    if (data.length > 0)
    {
      time_period = Date.parseDate(data[data.length-1].time_period);
    }

    for (var i = 0; i < size; ++i)
    {
      time_period = time_period.addDays(-1);
      data.push({ time_period: time_period.formatDate(), volume_m3: null, energy_kwh: null });
    }

    return data;
  }

    //----------------------------------
    static rightPaddingWeeklyArray(data, size) {

      var time_period = Date.today();
      if (data.length > 0)
      {
        time_period = Date.parseDate(data[data.length-1].time_period);
      }
  
      for (var i = 0; i < size; ++i)
      {
        time_period = time_period.addDays(-7);
        data.push({ time_period: time_period.formatDate(), volume_m3: null, energy_kwh: null });
      }
  
      return data;
    }

  //----------------------------------
  static rightPaddingMonthlyArray(data, size) {

    var time_period = new Date(Date.today().setDate(1));
    if (data.length > 0)
    {
      time_period = Date.parseMonthPeriod(data[data.length-1].time_period);
    }

    for (var i = 0; i < size; ++i)
    {
      time_period = time_period.addMonths(-1);
      data.push({ time_period: time_period.formatMonthPeriod(), volume_m3: null, energy_kwh: null });
    }

    return data;
  }

  //----------------------------------
  computeConsumptionTrendRatio(data, shift)
  {
    if (data != null)
    {
      for (var i = 0; i < data.length-shift; ++i)
      {
        var currentPeriodEnergy = data[i].energy_kwh
        var previousPeriodEnergy = data[i+shift].energy_kwh

        if (currentPeriodEnergy != null && currentPeriodEnergy >= 0 && previousPeriodEnergy != null && previousPeriodEnergy > 0)
        {
          var ratio = 100 * (currentPeriodEnergy - previousPeriodEnergy) / previousPeriodEnergy

          data[i].ratio = ratio
        }
        else if (currentPeriodEnergy != null && currentPeriodEnergy == 0 && previousPeriodEnergy != null && previousPeriodEnergy == 0)
        {
          data[i].ratio = 0
        }
        else if (currentPeriodEnergy != null && currentPeriodEnergy > 0 && previousPeriodEnergy != null && previousPeriodEnergy == 0)
        {
          data[i].ratio = 100
        }
        else
        {
          data[i].ratio = null
        }
      }
    }
  }

  //----------------------------------
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

  //----------------------------------
  renderMainBar(daily, unit_of_measurement) {
    if (this.config.showMainBar === true) {
      return html
        `
        <div class="section">
          <div class="main-bar">
            ${this.config.showIcon
              ? html`
                <div>
                  <span class="gazpar-icon bigger" style="background: none, url(${GazparIcon}) no-repeat; background-size: contain;"></span>  
                </div>`
              : html `` 
            }
            <div>
              <span class="energy">${daily != null && daily.length > 0 ? GazparCard.formatNumber(daily[0].energy_kwh, 1):"N/A"}</span><span class="energy-unit">${unit_of_measurement}</span><br/>
              <span class="volume">${daily != null && daily.length > 0 ? GazparCard.formatNumber(daily[0].volume_m3, 1):"N/A"}</span><span class="volume-unit">m³</span> - 
              <span class="date">${daily != null && daily.length > 0 ? Date.parseDate(daily[0].time_period).toLocaleDateString():"N/A"}</span>
            </div>
            ${this.config.showCost 
              ? html `
              <div>
                <span class="cost" title="Daily cost">${daily != null && daily.length > 0 ? GazparCard.formatNumber(daily[0].energy_kwh * this.config.pricePerKWh, 2):"N/A"}</span><span class="cost-unit"> €</span>
              </div>`
              : html ``
              }
          </div>
          <hr size="1" color="gray"/>
        </div>
        ` 
       }
  }

  //----------------------------------
  renderTitle(config) {
    if (this.config.showTitle === true) {
      return html
        `
          <div class="section">
          <div class="title">
          <span>${this.config.title}</span>
          </div>
          <hr size="1" color="gray"/>
          </div>` 
       }
  }

  //----------------------------------
  renderError(errorMsg) {
    if (this.config.showError === true) {
       if (errorMsg.length > 0){
          return html
            ` <div class="section">            
              <div style="color: red">
                <ha-icon id="icon" icon="mdi:alert-outline"></ha-icon>
                ${errorMsg.join("<br>")}
              </div>
              </div>
            `
       }
    }
  }

  //----------------------------------
  renderVersion() {
    if (this.config.showVersion === true) {
      return html
        ` <div class="section">        
          <div class="small-value" style="color: gray; text-align: right;">
            Gazpar Card Version ${VERSION}
          </div>
          </div>
        `
    }
  }

  //----------------------------------
  renderDailyHistory(data, unit_of_measurement, config) {

    if (config.showDailyHistory && data != null && data.length > 0) {
      // Keep the last 7 days.
      var today = config.asOfDate ? Date.parseDate(config.asOfDate)  : Date.today();
     
      var filteredDates = data.slice().reverse().filter(item => Date.parseDate(item.time_period) >= today.addDays(-7))

      if (filteredDates.length > 0) {
        // Fill with last days of unavailable data.
        var missingDate = Date.parseDate(filteredDates[filteredDates.length - 1].time_period).addDays(1)
        while (filteredDates.length < 7) {
          filteredDates.push({time_period: missingDate.formatDate(), volume_m3: null, energy_kwh: null })

          missingDate = missingDate.addDays(1)
        }
      }

      return html
      ` <div class="section">        
        <div class="history-table">
          ${this.renderHistoryHeader(config, "normal-value")}
          ${filteredDates.slice(filteredDates.length - 7, filteredDates.length).map(item => this.renderDailyDataColumnHistory(item, unit_of_measurement, config))}
        </div>
        <hr size="1" color="gray"/>
        </div>
      `
    }
  }

  //----------------------------------
  renderMonthlyHistoryTable(data, unit_of_measurement, config) {

    if (config.showMonthlyHistory && data != null && data.length > 0) {
      return html
      ` <div class="section">        
        <div class="history-table">
          ${this.renderHistoryHeader(config, "small-value")}
          ${data.slice(0, 12).reverse().map(item => this.renderMonthlyDataColumnHistory(item, unit_of_measurement, config))}
        </div>
        <hr size="1" color="gray"/>
        </div>
      `
    }
  }

  //----------------------------------
  renderDailyEnergyHistoryChart() {

    if (this.config.showDailyEnergyHistoryChart)
    {
      return html
      `
        <bar-chart id="dailyEnergyChart"></bar-chart>
        <hr size="1" color="gray"/>
      `
    } else {
      return html
      `
      `
    }
  }

  //----------------------------------
  renderDailyCostHistoryChart() {

    if (this.config.showDailyCostHistoryChart)
    {
      return html
      ` 
        <bar-chart id="dailyCostChart"></bar-chart>
        <hr size="1" color="gray"/>
      `
    } else {
      return html
      `
      `
    }
  }

  //----------------------------------
  renderWeeklyEnergyHistoryChart() {

    if (this.config.showWeeklyEnergyHistoryChart)
    {
      return html
      `
        <bar-chart id="weeklyEnergyChart"></bar-chart>
        <hr size="1" color="gray"/>
      `
    } else {
      return html
      `
      `
    }
  }

  //----------------------------------
  renderWeeklyCostHistoryChart() {

    if (this.config.showWeeklyCostHistoryChart)
    {
      return html
      ` 
        <bar-chart id="weeklyCostChart"></bar-chart>
        <hr size="1" color="gray"/>
      `
    } else {
      return html
      `
      `
    }
  }

  //----------------------------------
  renderMonthlyEnergyHistoryChart() {

    if (this.config.showMonthlyEnergyHistoryChart)
    {
      return html
      `
        <bar-chart id="monthlyEnergyChart"></bar-chart>
        <hr size="1" color="gray"/>
      `
    } else {
      return html
      `
      `
    }
  }

  //----------------------------------
  renderMonthlyCostHistoryChart() {

    if (this.config.showMonthlyCostHistoryChart)
    {
      return html
      ` 
        <bar-chart id="monthlyCostChart"></bar-chart>
        <hr size="1" color="gray"/>
      `
    } else {
      return html
      `
      `
    }
  }

  //----------------------------------
  renderYearlyEnergyHistoryChart() {

    if (this.config.showYearlyEnergyHistoryChart)
    {
      return html
      ` 
        <bar-chart id="yearlyEnergyChart"></bar-chart>
        <hr size="1" color="gray"/>
      `
    } else {
      return html
      `
      `
    }
  }

  //----------------------------------
  renderYearlyCostHistoryChart() {

    if (this.config.showYearlyCostHistoryChart)
    {
      return html
      ` 
        <bar-chart id="yearlyCostChart"></bar-chart>
        <hr size="1" color="gray"/>
      `
    } else {
      return html
      `
      `
    }
  }

  //----------------------------------
  renderDailyDataColumnHistory(item, unit_of_measurement, config) {

      var date = Date.parseDate(item.time_period)
      
      return html `
      <div class="history-column">
        <span class="history-header" title="${date.toLocaleDateString()}">${date.toLocaleDateString(undefined, {weekday: 'short'})}</span>
        ${config.showEnergyHistory ? this.renderDataValue(item.energy_kwh,  0, "normal-value") : ""}
        ${config.showVolumeHistory ? this.renderDataValue(item.volume_m3, 0, "normal-value") : ""}
        ${config.showCostHistory ? this.renderDataValue(item.energy_kwh != null ? item.energy_kwh * this.config.pricePerKWh:null, 2, "normal-value") : ""}
        ${config.showTrendRatioHistory ? this.renderRatioValue(item.ratio, "normal-value") : ""}
      </div>
      `
  }

  //----------------------------------
  renderMonthlyDataColumnHistory(item, unit_of_measurement, config) {

    var date = Date.parseMonthPeriod(item.time_period)
    
    return html `
    <div class="history-column">
      <span class="history-header" title="${date.toLocaleDateString(undefined, {month: 'long', year: 'numeric'})}">${date.toLocaleDateString(undefined, {month: 'narrow'})}</span>
      ${config.showEnergyHistory ? this.renderDataValue(item.energy_kwh, 0, "small-value") : ""}
      ${config.showVolumeHistory ? this.renderDataValue(item.volume_m3, 0, "small-value") : ""}
      ${config.showCostHistory ? this.renderDataValue(item.energy_kwh != null ? item.energy_kwh * this.config.pricePerKWh:null, 0, "small-value") : ""}
      ${config.showTrendRatioHistory ? this.renderRatioValue(item.ratio, "small-value") : ""}
    </div>
    `
  }

  //----------------------------------
  renderDataValue(value, decimals, cssname)
  {
    if (value != null && value >= 0) {
      return html `
        <br><span class="${cssname}">${GazparCard.formatNumber(value, decimals)}</span>
      `
    } else {
      return html `
        ${this.renderNoData(cssname)}
      `
    }
  }

  //----------------------------------
  renderRatioValue(value, cssname)
  {
    if (value != null)
    {
      return html `
      <br>
      <span class="ha-icon">
        <ha-icon icon="mdi:arrow-right" style="color: ${value > 0 ? "red":"green"}; display: inline-block; transform: rotate(${value < 0?'45': (value == 0? "0" : "-45")}deg)"></ha-icon>
      </span>
      <div class="${cssname}">
        <nobr>${(value > 0) ? '+': ''}${Math.round(value)}<span class="ratio-unit">%</span></nobr>
      </div>`
    } else {
      return html `
        ${this.renderNoData(cssname)}
      `
    }
  }

  //----------------------------------
  renderRowHeader(show, header, cssname) {

    if (show) {
       return html
       `<span class="${cssname}">${header}</span><br>
       `
      }
    else{
       return html
       `
       `
    }
  }

  //----------------------------------
  renderHistoryHeader(config, cssname) {
    if (this.config.showHistoryHeader) {
       return html
       `
        <div class="history-column">
          ${this.renderRowHeader(true, "", cssname)}
          ${this.renderRowHeader(this.config.showEnergyHistory, "kWh", cssname)}
          ${this.renderRowHeader(this.config.showVolumeHistory, "m³", cssname)}
          ${this.renderRowHeader(this.config.showCostHistory, "€", cssname)}
          ${this.renderRowHeader(this.config.showTrendRatioHistory, "%", cssname)}
        </div>
        `
    }
  }

  //----------------------------------
  renderNoData(cssname){
    return html
    `
      <br><span class="${cssname}" title="Donnée indisponible"><ha-icon id="icon" icon="mdi:alert-outline" style="color:orange"></ha-icon></span>
    `
  }

  //----------------------------------
  static formatDayOfWeek(time_period) {

    var date = Date.parseDate(time_period);
    var res = date.toLocaleDateString(undefined, {weekday: 'short'});

    return res;
  }

  //----------------------------------
  static formatWeek(time_period) {

    var date = Date.parseWeekPeriod(time_period);

    var res = date.getWeek();

    return res;
  }

  //----------------------------------
  static formatMonth(time_period) {

    var date = Date.parseMonthPeriod(time_period);
    var res = date.toLocaleDateString(undefined, {month: 'narrow'});

    return res;
  }

  //----------------------------------
  static formatYear(time_period) {

    var res = time_period;

    return res;
  }

  //----------------------------------
  static formatNumber(number, fractionDigits = 0) {

    var res = number.toLocaleString(undefined, {minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits});

    return res;
  }

  //----------------------------------
  // Compare two version number having the format x or x.y or x.y.z or x.y.z.a
  // but not necessarily the same length.
  static compareVersions(version1, version2) {

    const v1parts = version1.split('.');
    const v2parts = version2.split('.');

    const length = Math.max(v1parts.length, v2parts.length);

    for (let i = 0; i < length; i++) {
        const v1part = parseInt(v1parts[i] || '0', 10);
        const v2part = parseInt(v2parts[i] || '0', 10);

        if (v1part > v2part) {
            return 1;
        }
        if (v1part < v2part) {
            return -1;
        }
    }

    return 0;
  }

  //----------------------------------
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

      showMainBar: true,
      showIcon: true,
      showCost: true,

      showDailyHistory: true,
      showMonthlyHistory: true,
      showHistoryHeader: true,
      showEnergyHistory: true,
      showVolumeHistory: true,
      showCostHistory: true,
      showTrendRatioHistory: true,
      
      showDailyEnergyHistoryChart: true,
      showDailyCostHistoryChart: true,

      showWeeklyEnergyHistoryChart: true,
      showWeeklyCostHistoryChart: true,

      showMonthlyEnergyHistoryChart: true,
      showMonthlyCostHistoryChart: true,

      showYearlyEnergyHistoryChart: true,
      showYearlyCostHistoryChart: true,

      showError: true,
      showVersion: true
    }

    this.config = {
      ...defaultConfig,
      ...config
    };
  }

  //----------------------------------
  shouldUpdate(changedProps) {
    return hasConfigOrEntityChanged(this, changedProps);
  }

  //----------------------------------
  getCardSize() {
    return 3;
  }
 
  //----------------------------------
  static get styles() {
    return css`
      .section {
        margin: auto;
        padding: 0.5em 0.5em 0.5em 0.5em;
        position: relative;
        cursor: pointer;
      }

      .title {
        margin: auto;
        text-align: center;
        font-weight: 200;
        font-size: 2em;
        justify-content: space-between;
      }

      .main-bar {
        display: flex;
        overflow: hidden;
        align-items: center;
        justify-content: space-between;
        height: 6em;
      }
    
      .ha-icon {
        margin-right: 5px;
        color: var(--paper-item-icon-color);
      }
      
      .energy {
        font-weight: 300;
        font-size: 3.5em;
      }
    
      .energy-unit {
        font-weight: 300;
        font-size: 1.2em;
        display: inline-block;
      }

      .cost {
        font-weight: 300;
        font-size: 3.5em;
      }
    
      .cost-unit {
        font-weight: 300;
        font-size: 1.2em;
        display: inline-block;
      }
    
      .volume {
        font-weight: 200;
        font-size: 1em;
      }
    
      .volume-unit {
        font-weight: 100;
        font-size: 1em;
      }
        
      .ratio-unit {
        font-size: .8em;
      }
    
      .history-table {
        display: flex;
        overflow: hidden;
      }
    
      .history-column {
        flex: auto;
        text-align: center;
        border-right: .1em solid var(--divider-color);
        line-height: 2;
        box-sizing: border-box;
      }
    
      .history-header {
        font-weight: bold;
        text-transform: capitalize;
      }
  
      .week-history .day:last-child {
        border-right: none;
      }
    
      .normal-value {
        font-size: 1em;
      }

      .small-value {
        font-size: 0.8em;
      }
      
      .gazpar-icon.bigger {
        width: 6em;
        height: 5em;
        display: inline-block;
      }
      `;
  }
}

customElements.define('gazpar-card', GazparCard);
