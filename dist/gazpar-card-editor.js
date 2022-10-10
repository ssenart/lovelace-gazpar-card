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

const LitElement = customElements.get("hui-masonry-view") ? Object.getPrototypeOf(customElements.get("hui-masonry-view")) : Object.getPrototypeOf(customElements.get("hui-view"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

const HELPERS = window.loadCardHelpers();

export class GazparCardEditor extends LitElement {
  setConfig(config) {
    this._config = { ...config };
  }

  static get properties() {
    return { hass: {}, _config: {} };
  }

  get _entity() {
    return this._config.entity || "";
  }

  get _name() {
    return this._config.name || "";
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
   
  get _showError() {
    return this._config.showError !== false;
  }

  get _showWeeklyHistory() {
    return this._config.showWeeklyHistory !== false;
  }

  get _showMonthlyHistory() {
    return this._config.showMonthlyHistory !== false;
  }

  get _showHistoryHeader() {
    return this._config.showHistoryHeader !== false;
  }

  get _showVolumeHistory() {
    return this._config.showVolumeHistory !== false;
  }

  get _showCostHistory() {
    return this._config.showCostHistory !== false;
  }

  get _title() {
    return this._config.showTitle !== false;
  }
  
  get _current() {
    return this._config.current !== false;
  }

  get _details() {
    return this._config.details !== false;
  }

  get _nbJoursAffichage() {
    return this._config.nbJoursAffichage || 7;
  }

  get _showDayName() {
    return this._config.showDayName;
  }
  
  get _titleName() {
    return this._config.titleName || "";
  }

  get _costPerKWh() {
    return this._config.costPerKWh;
  }

  firstUpdated() {
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
          <paper-input
            label="Titre"
            .value="${this._titleName}"
            .configValue="${"titleName"}"
            @value-changed="${this._valueChanged}"
          ></paper-input>
          ${this.renderGazparPicker("Entity", this._entity, "entity")}
          <!-- Switches -->
          <ul class="switches">
            ${this.renderSwitchOption("Show title", this._showTitle, "showTitle")}
            ${this.renderSwitchOption("Show icon", this._showIcon, "showIcon")}
            ${this.renderSwitchOption("Show cost", this._showCost, "showCost")}          

            ${this.renderSwitchOption("Show weekly history", this._showWeeklyHistory, "showWeeklyHistory")}
            ${this.renderSwitchOption("Show monthly history", this._showMonthlyHistory, "showMonthlyHistory")}
            ${this.renderSwitchOption("Show history header", this._showHistoryHeader, "showHistoryHeader")}
            ${this.renderSwitchOption("Show energy history", this._showEnergyHistory, "showEnergyHistory")}
            ${this.renderSwitchOption("Show volume history", this._showVolumeHistory, "showVolumeHistory")}
            ${this.renderSwitchOption("Show cost history", this._showCostHistory, "showCostHistory")}
            
            ${this.renderSwitchOption("Show error", this._showError, "showError")}
          </ul>
          <!-- -->
          <paper-input
            label="nombre de jours"
            type="number"
            min="1"
            max="12"
            value=${this._nbJoursAffichage}
            .configValue="${"nbJoursAffichage"}"
            @value-changed="${this._valueChanged}"
          ></paper-input><br>
          <paper-input
            label="Nom du jour de la semaine( valeur possible : long, short, narrow )"
            .value="${this._showDayName}"
            .configValue="${"showDayName"}"
            @value-changed="${this._valueChanged}"
          ></paper-input>
          <paper-input
          label="Tarif du gaz par kWh:"
          .value="${this._costPerKWh}"
          .configValue="${"costPerKWh"}"
          @value-changed="${this._valueChanged}"
        ></paper-input>
        </div>
      </div>
    `;
  }
  
  renderGazparPicker(label, entity, configAttr) {
    return this.renderPicker(label, entity, configAttr, "sensor.gazpar");
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
