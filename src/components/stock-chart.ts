import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HistoricalBar } from '../models/market';

@customElement('stock-chart')
export class StockChart extends LitElement {
  @property({ type: Array })
  bars: HistoricalBar[] = [];

  @property({ type: Number })
  change = 0;

  @state()
  private hoverIndex: number | null = null;

  static styles = css`
    :host {
      display: block;
      width: 100%;
      min-height: 280px;
    }

    .chart {
      position: relative;
      width: 100%;
      height: clamp(280px, 42vh, 460px);
      border-top: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
      overflow: hidden;
    }

    svg {
      width: 100%;
      height: 100%;
      display: block;
      cursor: crosshair;
      touch-action: none;
    }

    .empty {
      height: 280px;
      display: grid;
      place-items: center;
      color: var(--text-2);
      border-top: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
    }

    .tooltip {
      position: absolute;
      top: 18px;
      right: 18px;
      display: grid;
      gap: 4px;
      min-width: 150px;
      padding: 10px 12px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgba(13, 17, 23, 0.86);
      box-shadow: 0 14px 30px rgba(0, 0, 0, 0.3);
      pointer-events: none;
      backdrop-filter: blur(14px);
    }

    .tooltip strong {
      font-size: 20px;
      font-weight: 650;
    }

    .tooltip span {
      font-size: 12px;
      color: var(--text-2);
    }
  `;

  render() {
    if (this.bars.length < 2) {
      return html`<div class="empty">No chart data available</div>`;
    }

    const width = 1000;
    const height = 360;
    const padding = 18;
    const closes = this.bars.map((bar) => bar.close);
    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const range = max - min || 1;
    const color = this.change >= 0 ? 'var(--green)' : 'var(--red)';
    const points = this.bars.map((bar, index) => {
      const x = padding + (index / (this.bars.length - 1)) * (width - padding * 2);
      const y = height - padding - ((bar.close - min) / range) * (height - padding * 2);
      return { x, y, bar };
    });
    const linePath = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)},${point.y.toFixed(2)}`)
      .join(' ');
    const areaPath = `${linePath} L${width - padding},${height - padding} L${padding},${height - padding} Z`;
    const hover = this.hoverIndex === null ? points[points.length - 1] : points[this.hoverIndex];
    const gradientId = this.change >= 0 ? 'chart-fill-up' : 'chart-fill-down';

    return html`
      <div class="chart" @mouseleave=${this.clearHover}>
        <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" @mousemove=${this.handleMove}>
          <defs>
            <linearGradient id="chart-fill-up" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="#24c875" stop-opacity="0.34"></stop>
              <stop offset="100%" stop-color="#24c875" stop-opacity="0"></stop>
            </linearGradient>
            <linearGradient id="chart-fill-down" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="#ff5f57" stop-opacity="0.34"></stop>
              <stop offset="100%" stop-color="#ff5f57" stop-opacity="0"></stop>
            </linearGradient>
          </defs>
          ${[0.25, 0.5, 0.75].map(
            (fraction) =>
              html`<line
                x1=${padding}
                x2=${width - padding}
                y1=${height * fraction}
                y2=${height * fraction}
                stroke="rgba(255,255,255,0.07)"
                stroke-width="1"
              ></line>`
          )}
          <path d=${areaPath} fill="url(#${gradientId})"></path>
          <path d=${linePath} fill="none" stroke=${color} stroke-width="3.6" vector-effect="non-scaling-stroke"></path>
          ${hover
            ? html`
                <line
                  x1=${hover.x}
                  x2=${hover.x}
                  y1=${padding}
                  y2=${height - padding}
                  stroke="rgba(255,255,255,0.22)"
                  stroke-width="1"
                  vector-effect="non-scaling-stroke"
                ></line>
                <circle cx=${hover.x} cy=${hover.y} r="5" fill=${color}></circle>
              `
            : nothing}
        </svg>
        ${hover
          ? html`<div class="tooltip">
              <strong>${formatMoney(hover.bar.close)}</strong>
              <span>${formatDate(hover.bar.timestamp)}</span>
              <span>Volume ${formatCompact(hover.bar.volume)}</span>
            </div>`
          : nothing}
      </div>
    `;
  }

  private handleMove(event: MouseEvent) {
    const svg = event.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    this.hoverIndex = Math.round(ratio * (this.bars.length - 1));
  }

  private clearHover() {
    this.hoverIndex = null;
  }
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value));
}

function formatCompact(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value);
}
