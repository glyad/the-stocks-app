import { LitElement, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import {
  FinancialChartType,
  FinancialChartVolumeType,
  FinancialChartXAxisMode,
  FinancialChartZoomSliderType,
  IgcFinancialChartModule
} from 'igniteui-webcomponents-charts';
import type { IgcFinancialChartComponent } from 'igniteui-webcomponents-charts';
import type { HistoricalBar } from '../models/market';

type FinancialChartRow = {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

IgcFinancialChartModule.register();

@customElement('stock-chart')
export class StockChart extends LitElement {
  @property({ type: Array })
  bars: HistoricalBar[] = [];

  @property({ type: Number })
  change = 0;

  @query('igc-financial-chart')
  private chart?: IgcFinancialChartComponent;

  static styles = css`
    :host {
      display: block;
      width: 100%;
      min-height: 280px;
    }

    .chart {
      width: 100%;
      height: clamp(320px, 44vh, 500px);
      border-top: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
      overflow: hidden;
    }

    igc-financial-chart {
      width: 100%;
      height: 100%;
      display: block;
      --ig-chart-default-tooltip-background-color: rgba(13, 17, 23, 0.94);
      --ig-chart-default-tooltip-text-color: var(--text-0);
    }

    .empty {
      height: 280px;
      display: grid;
      place-items: center;
      color: var(--text-2);
      border-top: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
    }
  `;

  protected updated(changedProperties: Map<PropertyKey, unknown>) {
    if (changedProperties.has('bars') || changedProperties.has('change')) {
      this.configureChart();
    }
  }

  render() {
    if (this.bars.length < 2) {
      return html`<div class="empty">No chart data available</div>`;
    }

    return html`
      <div class="chart">
        <igc-financial-chart></igc-financial-chart>
      </div>
    `;
  }

  private configureChart() {
    if (!this.chart || this.bars.length < 2) return;

    const positive = this.change >= 0;
    this.chart.width = '100%';
    this.chart.height = '100%';
    this.chart.dataSource = this.chartRows;
    this.chart.chartType = FinancialChartType.Candle;
    this.chart.volumeType = FinancialChartVolumeType.Column;
    this.chart.xAxisMode = FinancialChartXAxisMode.Ordinal;
    this.chart.zoomSliderType = FinancialChartZoomSliderType.None;
    this.chart.isToolbarVisible = false;
    this.chart.isHorizontalZoomEnabled = true;
    this.chart.isWindowSyncedToVisibleRange = true;
    this.chart.yAxisAbbreviateLargeNumbers = true;
    this.chart.resolution = 2;
    this.chart.negativeBrushes = ['#ff5f57'];
    this.chart.negativeOutlines = ['#ff5f57'];
    this.chart.volumeBrushes = [positive ? '#24c87566' : '#ff5f5766'];
    this.chart.volumeOutlines = [positive ? '#24c875' : '#ff5f57'];
    this.chart.indicatorBrushes = ['#5aa7ff'];
    this.chart.indicatorNegativeBrushes = ['#ff5f57'];
    this.chart.bindData();
  }

  private get chartRows(): FinancialChartRow[] {
    return this.bars.map((bar) => ({
      date: new Date(bar.timestamp),
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
      volume: bar.volume
    }));
  }
}
