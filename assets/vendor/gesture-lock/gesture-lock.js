/**
 * 原生手势密码组件 - 3x3 九宫格
 * 不依赖任何第三方库
 */
(function() {
  'use strict';

  class GestureLock {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      if (!this.container) {
        console.error('GestureLock: container not found');
        return;
      }

      this.options = {
        matrix: options.matrix || [3, 3],
        radius: options.radius || 24,
        margin: options.margin || 14,
        patternColor: options.patternColor || '#2f6fb7',
        errorColor: options.errorColor || '#d84c5c',
        pointColor: options.pointColor || '#d7e5f5',
        pointHoverColor: options.pointHoverColor || '#2f6fb7',
        onDraw: options.onDraw || function() {}
      };

      this.points = [];
      this.pattern = [];
      this.isDrawing = false;
      this.lastPoint = null;
      this.canvas = null;
      this.ctx = null;
      this.touchX = 0;
      this.touchY = 0;
      this.isError = false;

      this.init();
    }

    init() {
      this.createCanvas();
      this.calculatePoints();
      this.bindEvents();
      this.render();
    }

    createCanvas() {
      this.container.innerHTML = '';
      this.container.classList.add('gesture-lock-container');

      this.canvas = document.createElement('canvas');
      this.canvas.classList.add('gesture-lock-canvas');
      
      const size = this.options.matrix[0] * (this.options.radius * 2 + this.options.margin * 2) + this.options.margin * 2;
      const devicePixelRatio = window.devicePixelRatio || 1;
      
      // 考虑设备像素比，提高Canvas分辨率
      this.canvas.width = size * devicePixelRatio;
      this.canvas.height = size * devicePixelRatio;
      this.canvas.style.width = size + 'px';
      this.canvas.style.height = size + 'px';
      
      // 设置绘图上下文的缩放比例
      this.container.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
      this.ctx.scale(devicePixelRatio, devicePixelRatio);
    }

    calculatePoints() {
      const [rows, cols] = this.options.matrix;
      const spacing = this.options.radius * 2 + this.options.margin * 2;
      const offset = this.options.margin + this.options.radius;

      this.points = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          this.points.push({
            x: col * spacing + offset,
            y: row * spacing + offset,
            index: row * cols + col + 1,
            active: false
          });
        }
      }
    }

    bindEvents() {
      const handleStart = (e) => {
        e.preventDefault();
        this.isDrawing = true;
        this.pattern = [];
        this.isError = false;
        this.updateTouchPosition(e);
        this.checkPointHit();
        this.render();
      };

      const handleMove = (e) => {
        e.preventDefault();
        if (!this.isDrawing) return;
        this.updateTouchPosition(e);
        this.checkPointHit();
        this.render();
      };

      const handleEnd = (e) => {
        e.preventDefault();
        if (!this.isDrawing) return;
        this.isDrawing = false;
        
        const patternStr = this.pattern.map(p => p.index).join('');
        this.options.onDraw(patternStr);
        
        if (patternStr.length === 0) {
          this.reset();
        }
      };

      this.canvas.addEventListener('mousedown', handleStart);
      this.canvas.addEventListener('mousemove', handleMove);
      this.canvas.addEventListener('mouseup', handleEnd);
      this.canvas.addEventListener('mouseleave', handleEnd);

      this.canvas.addEventListener('touchstart', handleStart, { passive: false });
      this.canvas.addEventListener('touchmove', handleMove, { passive: false });
      this.canvas.addEventListener('touchend', handleEnd, { passive: false });
    }

    updateTouchPosition(e) {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      // 计算触摸点在Canvas显示区域内的相对位置
      const displayWidth = this.canvas.offsetWidth;
      const displayHeight = this.canvas.offsetHeight;
      
      // 转换为Canvas绘图坐标系（考虑了设备像素比的缩放）
      this.touchX = (clientX - rect.left) * (displayWidth / rect.width);
      this.touchY = (clientY - rect.top) * (displayHeight / rect.height);
    }

    checkPointHit() {
      const hitRadius = this.options.radius * 1.5;
      
      for (const point of this.points) {
        if (point.active) continue;
        
        const dx = this.touchX - point.x;
        const dy = this.touchY - point.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < hitRadius) {
          point.active = true;
          this.pattern.push(point);
          this.lastPoint = point;
          break;
        }
      }
    }

    render() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      const lineColor = this.isError ? this.options.errorColor : this.options.patternColor;
      const pointColor = this.options.pointColor;
      const pointActiveColor = this.isError ? this.options.errorColor : this.options.pointHoverColor;

      this.points.forEach(point => {
        const color = point.active ? pointActiveColor : pointColor;
        
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, this.options.radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
      });

      if (this.pattern.length > 0) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.pattern[0].x, this.pattern[0].y);
        
        for (let i = 1; i < this.pattern.length; i++) {
          this.ctx.lineTo(this.pattern[i].x, this.pattern[i].y);
        }
        
        if (this.isDrawing && this.lastPoint) {
          this.ctx.lineTo(this.touchX, this.touchY);
        }
        
        this.ctx.strokeStyle = lineColor;
        this.ctx.lineWidth = 8;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();
      }
    }

    reset() {
      this.pattern = [];
      this.isDrawing = false;
      this.lastPoint = null;
      this.isError = false;
      this.points.forEach(p => p.active = false);
      this.render();
    }

    setError() {
      this.isError = true;
      this.render();
      setTimeout(() => {
        this.reset();
      }, 520);
    }
  }

  window.GestureLock = GestureLock;
})();
