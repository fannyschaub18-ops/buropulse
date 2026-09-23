if (!customElements.get('buropulse-test')) {
  customElements.define('buropulse-test', class extends HTMLElement {
    connectedCallback() {
      this.style.display = 'block';
      this.innerHTML = '<div style="background:#183A35;color:white;padding:30px">Test BuroPulse : chargement réussi</div>';
    }
  });
}