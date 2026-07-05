import '@webcomponents/custom-elements/custom-elements.min';
import { defineComponents, IgcButtonComponent } from 'igniteui-webcomponents';
import 'igniteui-webcomponents/themes/light/bootstrap.css';
import './styles.css';
import './components/stocks-app';

defineComponents(IgcButtonComponent);

const app = document.querySelector<HTMLDivElement>('#app');

if (app) {
  app.innerHTML = '<stocks-app></stocks-app>';
}
