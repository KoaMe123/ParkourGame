export class InputManager {
  constructor() {
    this.jumpCallback = null;
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onClick = this._onClick.bind(this);
    this._onTouch = this._onTouch.bind(this);
  }

  init(canvas) {
    document.addEventListener('keydown', this._onKeyDown);
    canvas.addEventListener('click', this._onClick);
    canvas.addEventListener('touchstart', this._onTouch, { passive: false });
  }

  onJump(callback) {
    this.jumpCallback = callback;
  }

  _triggerJump(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (this.jumpCallback) this.jumpCallback();
  }

  _onKeyDown(e) {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      e.preventDefault();
      this._triggerJump(e);
    }
  }

  _onClick(e) {
    e.preventDefault();
    this._triggerJump(e);
  }

  _onTouch(e) {
    e.preventDefault();
    this._triggerJump(e);
  }

  destroy() {
    document.removeEventListener('keydown', this._onKeyDown);
    // canvas 事件如在外部管理也可移除此处，简单起见暂略
  }
}