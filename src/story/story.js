// Story reading pages: shared nav, theme toggle and the Kage assistant (which also answers
// the pages' own "Ask Kage" buttons through window.KageAsk).
import { renderNav, wireTheme } from '../page3d/nav.js';
import './story.css';

renderNav(null);
wireTheme();
import('../kage/widget.js').then((m) => m.mountKage());
