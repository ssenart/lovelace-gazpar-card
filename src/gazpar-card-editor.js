import { LitElement, html, css } from 'lit';

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

if (
  !customElements.get("ha-switch") &&
  customElements.get("paper-toggle-button")
) {
  customElements.define("ha-switch", customElements.get("paper-toggle-button"));
}

//const LitElement = customElements.get("hui-masonry-view") ? Object.getPrototypeOf(customElements.get("hui-masonry-view")) : Object.getPrototypeOf(customElements.get("hui-view"));
//const html = LitElement.prototype.html;
//const css = LitElement.prototype.css;

export class GazparCardEditor extends LitElement {
  setConfig(config) {
    this._config = { ...config };
  }

  static get properties() {
    return { hass: {}, _config: {} };
  }

  get _title() {
    return this._config.title || "GrDF data";
  }

  get _entity() {
    return this._config.entity || "sensor.gazpar";
  }

  get _pricePerKWh() {
    return this._config.pricePerKWh || 0.0;
  }

  get _showIcon() {
    return this._config.showIcon !== false;
  }
  
  get _showCost() {
    return this._config.showCost !== false;
  }
  
  get _showTitle() {
    return this._config.showTitle !== false;
  }

  get _showMainBar() {
    return this._config.showMainBar !== false;
  }
   
  get _showError() {
    return this._config.showError !== false;
  }

  get _showVersion() {
    return this._config.showVersion !== false;
  }

  get _showDailyHistory() {
    return this._config.showDailyHistory !== false;
  }

  get _showMonthlyHistory() {
    return this._config.showMonthlyHistory !== false;
  }

  get _showHistoryHeader() {
    return this._config.showHistoryHeader !== false;
  }

  get _showEnergyHistory() {
    return this._config.showEnergyHistory !== false;
  }

  get _showVolumeHistory() {
    return this._config.showVolumeHistory !== false;
  }

  get _showCostHistory() {
    return this._config.showCostHistory !== false;
  }

  get _showTrendRatioHistory() {
    return this._config.showTrendRatioHistory !== false;
  }

  get _showMonthlyEnergyHistoryChart() {
    return this._config.showMonthlyEnergyHistoryChart !== false;
  }

  get _showMonthlyCostHistoryChart() {
    return this._config.showMonthlyCostHistoryChart !== false;
  }

  get _showYearlyEnergyHistoryChart() {
    return this._config.showYearlyEnergyHistoryChart !== false;
  }

  get _showYearlyCostHistoryChart() {
    return this._config.showYearlyCostHistoryChart !== false;
  }

  firstUpdated() {

    const HELPERS = window.loadCardHelpers();

    HELPERS.then(help => {
      if (help.importMoreInfoControl) {
        help.importMoreInfoControl("fan");
      }
    })
  }

  render() {
    if (!this.hass) {
      return html``;
    }

    return html`
      <div class="card-config">
        <div>

          ${this.renderGazparPicker("Entity", this._entity, "entity")}

          <ha-entity-picker
            label="Entity"
            .hass="${this.hass}"
            .value="${this._entity}"
            .configValue="${"entity"}"
            .includeDomains="sensor"
            @change="${this._valueChanged}"
            allow-custom-entity
          ></ha-entity-picker>

          <paper-input
            label="Entity"
            .value="${this._entity}"
            .configValue="${"entity"}"
            @value-changed="${this._valueChanged}"
          ></paper-input>

          <paper-input
            label="Title"
            .value="${this._title}"
            .configValue="${"title"}"
            @value-changed="${this._valueChanged}"
          ></paper-input>

          <paper-input
            label="Gas price (€/kWh):"
            .value="${this._pricePerKWh}"
            .configValue="${"pricePerKWh"}"
            @value-changed="${this._valueChanged}"
          ></paper-input>

          <!-- Switches -->
          <ul class="switches">
            ${this.renderSwitchOption("Show title", this._showTitle, "showTitle")}
            ${this.renderSwitchOption("Show main bar", this._showMainBar, "showMainBar")}
            ${this.renderSwitchOption("Show icon", this._showIcon, "showIcon")}
            ${this.renderSwitchOption("Show cost", this._showCost, "showCost")}          

            ${this.renderSwitchOption("Show daily history", this._showDailyHistory, "showDailyHistory")}
            ${this.renderSwitchOption("Show monthly history", this._showMonthlyHistory, "showMonthlyHistory")}
            ${this.renderSwitchOption("Show history header", this._showHistoryHeader, "showHistoryHeader")}
            ${this.renderSwitchOption("Show energy history", this._showEnergyHistory, "showEnergyHistory")}
            ${this.renderSwitchOption("Show volume history", this._showVolumeHistory, "showVolumeHistory")}
            ${this.renderSwitchOption("Show cost history", this._showCostHistory, "showCostHistory")}
            ${this.renderSwitchOption("Show trend ratio history", this._showTrendRatioHistory, "showTrendRatioHistory")}

            ${this.renderSwitchOption("Show monthly energy history chart", this._showMonthlyEnergyHistoryChart, "showMonthlyEnergyHistoryChart")}
            ${this.renderSwitchOption("Show monthly cost history chart", this._showMonthlyCostHistoryChart, "showMonthlyCostHistoryChart")}
            
            ${this.renderSwitchOption("Show yearly energy history chart", this._showYearlyEnergyHistoryChart, "showYearlyEnergyHistoryChart")}
            ${this.renderSwitchOption("Show yearly cost history chart", this._showYearlyCostHistoryChart, "showYearlyCostHistoryChart")}

            ${this.renderSwitchOption("Show error", this._showError, "showError")}
            ${this.renderSwitchOption("Show version", this._showVersion, "showVersion")}
          </ul>

        </div>
      </div>
    `;
  }
  
  renderGazparPicker(label, entity, configAttr) {
    return this.renderPicker(label, entity, configAttr, "sensor");
  }

  renderPicker(label, entity, configAttr, domain) {
    return html`
              <ha-entity-picker
                label="${label}"
                .hass="${this.hass}"
                .value="${entity}"
                .configValue="${configAttr}"
                .includeDomains="${domain}"
                @change="${this._valueChanged}"
                allow-custom-entity
              ></ha-entity-picker>
            `
  }

  renderSwitchOption(label, state, configAttr) {
    return html`
      <li class="switch">
              <ha-switch
                .checked=${state}
                .configValue="${configAttr}"
                @change="${this._valueChanged}">
                </ha-switch><span>${label}</span>
            </div>
          </li>
    `
  }

  _valueChanged(ev) {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target;
    if (target.configValue) {
      if (target.value === "") {
        delete this._config[target.configValue];
      } else {
        this._config = {
          ...this._config,
          [target.configValue]:
            target.checked !== undefined ? target.checked : target.value,
        };
      }
    }
    fireEvent(this, "config-changed", { config: this._config });
  }

  static get styles() {
    return css`
      .switches {
        margin: 8px 0;
        display: flex;
        flex-flow: row wrap;
        list-style: none;
        padding: 0;
      }
      .switch {
        display: flex;
        align-items: center;
        width: 50%;
        height: 40px;
      }
      .switches span {
        padding: 0 16px;
      }
    `;
  }
}

customElements.define("gazpar-card-editor", GazparCardEditor);
