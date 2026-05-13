export class UI {
  constructor() {
    this.scoreEl = document.getElementById('scoreValue');
    this.scoreDisplay = document.getElementById('scoreDisplay');
    this.progressBar = document.getElementById('progressBar');
    this.messageOverlay = document.getElementById('messageOverlay');
    this.msgTitle = document.getElementById('msgTitle');
    this.msgSubtitle = document.getElementById('msgSubtitle');
    this.btnRestart = document.getElementById('btnRestart');
    this.restartHint = document.getElementById('restartHint');
    this.hintText = document.getElementById('hintText');
  }

  updateScore(score) {
    this.scoreEl.textContent = score;
  }

  updateProgress(ratio) {
    this.progressBar.style.width = Math.min(100, Math.round(ratio * 100)) + '%';
  }

  showMessage(title, subtitle, showBtn = false, showHint = false) {
    this.msgTitle.textContent = title;
    this.msgSubtitle.textContent = subtitle;
    this.messageOverlay.classList.add('visible');
    this.btnRestart.style.display = showBtn ? 'inline-block' : 'none';
    this.restartHint.style.display = showHint ? 'block' : 'none';
    this.hintText.style.opacity = '0';
  }

  hideMessage() {
    this.messageOverlay.classList.remove('visible');
    this.btnRestart.style.display = 'none';
    this.restartHint.style.display = 'none';
  }

  showHint(visible = true) {
    this.hintText.style.opacity = visible ? '0.7' : '0';
  }

  pulseScore() {
    this.scoreDisplay.classList.remove('score-pop');
    void this.scoreDisplay.offsetWidth;
    this.scoreDisplay.classList.add('score-pop');
  }
}