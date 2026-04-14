(() => {
  const initUserNameEyeToggle = () => {
    const btn = document.getElementById('userNameEyeBtn');
    const icon = document.getElementById('userNameEyeIcon');
    const text = document.getElementById('userNameText');
    if (!btn || !icon || !text) return;

    let opened = false;
    const render = () => {
      text.textContent = opened ? '\u9ad8\u6d77\u6d9b' : '**\u6d9b';
      icon.src = opened ? 'assets/icons/eye_open.svg' : 'assets/icons/eye_closed.svg';
      btn.setAttribute('aria-pressed', opened ? 'true' : 'false');
      btn.setAttribute('aria-label', opened ? '\u9690\u85cf\u59d3\u540d' : '\u663e\u793a\u59d3\u540d');
    };

    render();
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      opened = !opened;
      render();
    });
  };

  const initAssetVisibilityToggle = () => {
    const section = document.getElementById('assetSection');
    const btn = document.getElementById('assetEyeBtn');
    const icon = document.getElementById('assetEyeIcon');
    const arcProgress = section?.querySelector('.asset-arc-progress');
    const numberNodes = Array.from(section?.querySelectorAll('.asset-value-number') || []);
    const incomeNode = section?.querySelector('.asset-income-number');
    if (!section || !btn || !icon || !arcProgress) return;

    let frameId = 0;
    let hasPassedGestureVerification = false;
    let isVerifying = false;

    const verifyGestureBeforeFirstOpen = (() => {
      const modal = document.getElementById('assetPatternModal');
      const closeBtn = document.getElementById('assetPatternClose');
      const hint = document.getElementById('assetPatternHint');
      const holderSelector = '#assetPatternLock';
      const rightPattern = '23698';
      if (!modal || !closeBtn || !hint) return () => Promise.resolve(true);

      let lockInstance = null;
      let activeResolver = null;
      let hideTimerId = 0;

      const setHint = (text, state = '') => {
        hint.textContent = text;
        hint.classList.toggle('is-error', state === 'error');
        hint.classList.toggle('is-success', state === 'success');
      };

      const resetLock = () => {
        window.clearTimeout(hideTimerId);
        if (lockInstance) lockInstance.reset();
      };

      const finish = (passed) => {
        window.clearTimeout(hideTimerId);
        modal.classList.remove('is-visible');
        window.setTimeout(() => {
          modal.hidden = true;
        }, 220);
        if (lockInstance) lockInstance.reset();
        if (activeResolver) {
          activeResolver(passed);
          activeResolver = null;
        }
      };

      const ensureLock = () => {
        if (lockInstance || typeof window.GestureLock !== 'function') return;

        lockInstance = new window.GestureLock(holderSelector, {
          matrix: [3, 3],
          margin: 14,
          radius: 24,
          patternColor: '#2f6fb7',
          errorColor: '#d84c5c',
          pointColor: '#d7e5f5',
          pointHoverColor: '#2f6fb7',
          onDraw: (pattern) => {
            if (pattern === rightPattern) {
              setHint('验证通过，正在打开资产信息', 'success');
              hideTimerId = window.setTimeout(() => finish(true), 180);
              return;
            }

            setHint('手势密码错误，请重新绘制', 'error');
            lockInstance.setError();
          }
        });
      };

      const cancel = () => finish(false);

      closeBtn.addEventListener('click', cancel);
      modal.addEventListener('click', (event) => {
        if (event.target?.dataset.close === 'asset-pattern') cancel();
      });

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !modal.hidden) cancel();
      });

      return () => new Promise((resolve) => {
        if (typeof window.GestureLock !== 'function') {
          resolve(false);
          alert('图案验证模块加载失败，请稍后重试');
          return;
        }

        ensureLock();
        activeResolver = resolve;
        resetLock();
        setHint('首次查看资产前需要完成图案验证');
        modal.hidden = false;
        requestAnimationFrame(() => modal.classList.add('is-visible'));
      });
    })();

    const parseDurationMs = (rawValue) => {
      const value = String(rawValue || '').trim();
      if (!value) return 300;
      if (value.endsWith('ms')) return Number.parseFloat(value) || 300;
      if (value.endsWith('s')) return (Number.parseFloat(value) || 0.3) * 1000;
      return Number.parseFloat(value) || 300;
    };

    const duration = parseDurationMs(getComputedStyle(section).getPropertyValue('--asset-anim-duration'));

    const numberConfigs = numberNodes.map((node) => ({
      node,
      value: Number.parseFloat(node.dataset.value || '0') || 0,
      decimals: Number.parseInt(node.dataset.decimals || '0', 10) || 0,
      prefix: node.dataset.prefix || '',
      suffix: node.dataset.suffix || ''
    }));
    const totalAssetConfig = numberConfigs.find((config) => config.node.closest('.asset-total-value')) || numberConfigs[0] || null;
    const incomeConfig = incomeNode ? {
      node: incomeNode,
      value: 210.77, // 固定值
      decimals: Number.parseInt(incomeNode.dataset.decimals || '2', 10) || 2,
      prefix: incomeNode.dataset.prefix || '',
      suffix: incomeNode.dataset.suffix || ''
    } : null;

    const formatNumber = (value, config) => {
      const current = Number.isFinite(value) ? value : 0;
      return `${config.prefix}${current.toLocaleString('en-US', {
        minimumFractionDigits: config.decimals,
        maximumFractionDigits: config.decimals
      })}${config.suffix}`;
    };

    const stopAnimation = () => {
      if (!frameId) return;
      cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const setArcProgress = (progress) => {
      const clamped = Math.max(0, Math.min(1, progress));
      arcProgress.style.strokeDashoffset = String(100 - clamped * 100);
    };

    const setNumberProgress = (progress) => {
      const clamped = Math.max(0, Math.min(1, progress));
      numberConfigs.forEach((config) => {
        config.node.textContent = formatNumber(config.value * clamped, config);
      });
    };
    const setIncomeProgress = (progress) => {
      if (!incomeConfig) return;
      const clamped = Math.max(0, Math.min(1, progress));
      incomeConfig.node.textContent = formatNumber(incomeConfig.value * clamped, incomeConfig);
    };

    const render = (opened) => {
      stopAnimation();
      section.classList.toggle('is-open', opened);
      section.classList.toggle('is-hidden', !opened);
      section.classList.remove('is-animating');
      icon.src = opened ? 'assets/icons/eye_open.svg' : 'assets/icons/eye_closed.svg';
      icon.alt = opened ? '\u8d44\u4ea7\u53ef\u89c1' : '\u8d44\u4ea7\u5df2\u9690\u85cf';
      btn.setAttribute('aria-label', opened ? '\u9690\u85cf\u8d44\u4ea7' : '\u663e\u793a\u8d44\u4ea7');
      btn.setAttribute('aria-pressed', opened ? 'true' : 'false');

      if (!opened) {
        setArcProgress(0);
        setNumberProgress(0);
        setIncomeProgress(0);
      }
    };

    // 计算总资产
    const calculateTotalAsset = () => {
      // 找到理财资产元素
      const financeAssetElement = document.querySelector('.asset-item-finance .asset-value-number');
      // 找到存款元素
      const depositAssetElement = document.querySelector('.asset-item-deposit .asset-value-number');
      // 找到总资产元素
      const totalAssetElement = document.querySelector('.asset-total-value .asset-value-number');
      
      if (financeAssetElement && depositAssetElement && totalAssetElement) {
        // 获取理财资产数值
        const financeAsset = parseFloat(financeAssetElement.dataset.value) || 0;
        // 获取存款数值
        const depositAsset = parseFloat(depositAssetElement.dataset.value) || 0;
        // 计算总资产
        const totalAsset = financeAsset + depositAsset;
        // 获取小数位数
        const decimals = parseInt(totalAssetElement.dataset.decimals || '2', 10) || 2;
        // 获取前缀
        const prefix = totalAssetElement.dataset.prefix || '';
        // 格式化总资产
        const formattedTotal = totalAsset.toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        });
        
        // 更新总资产元素
        totalAssetElement.dataset.value = totalAsset;
        totalAssetElement.textContent = `${prefix}${formattedTotal}`;
        
        // 更新numberConfigs中的总资产配置
        const totalAssetConfig = numberConfigs.find((config) => config.node.closest('.asset-total-value'));
        if (totalAssetConfig) {
          totalAssetConfig.value = totalAsset;
        }
        
        return totalAsset;
      }
      
      return 0;
    };

    // 计算日收益并更新
    const updateDailyIncome = () => {
      // 先计算总资产
      const totalAsset = calculateTotalAsset();
      // 找到日收益元素
      const incomeElement = document.querySelector('.asset-income-number');
      
      if (incomeElement) {
        // 年化利率3.1%
        const annualRate = 0.031;
        // 计算日收益 = 总资产 × 年化利率 ÷ 365
        const dailyIncome = totalAsset * annualRate / 365;
        // 获取小数位数
        const decimals = parseInt(incomeElement.dataset.decimals || '2', 10) || 2;
        // 获取后缀
        const suffix = incomeElement.dataset.suffix || '';
        // 格式化日收益
        const formattedIncome = dailyIncome.toFixed(decimals);
        
        // 更新incomeConfig的value以确保动画正确
        if (incomeConfig) {
          incomeConfig.value = dailyIncome;
        }
        
        // 更新日收益元素
        incomeElement.textContent = `${formattedIncome}${suffix}`;
      }
    };

    const animateOpen = () => {
      // 先计算总资产和日收益
      calculateTotalAsset();
      updateDailyIncome();
      
      render(true);
      setArcProgress(0);
      setNumberProgress(0);
      setIncomeProgress(0);

      frameId = requestAnimationFrame(() => {
        section.classList.add('is-animating');
        const startTime = performance.now();

        const tick = (now) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);

          setArcProgress(eased);
          setNumberProgress(eased);
          setIncomeProgress(eased);

          if (progress < 1) {
            frameId = requestAnimationFrame(tick);
            return;
          }

          setArcProgress(1);
          setNumberProgress(1);
          setIncomeProgress(1);
          frameId = 0;
        };

        frameId = requestAnimationFrame(tick);
      });
    };

    // 初始化时计算日收益
    updateDailyIncome();

    render(false);
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (btn.getAttribute('aria-pressed') === 'true') {
        render(false);
        return;
      }

      if (!hasPassedGestureVerification) {
        if (isVerifying) return;
        isVerifying = true;
        btn.disabled = true;
        const verified = await verifyGestureBeforeFirstOpen();
        isVerifying = false;
        btn.disabled = false;
        if (!verified) return;
        hasPassedGestureVerification = true;
      }

      animateOpen();
    });
  };

  const initScrollHeaderFade = () => {
    const bar = document.getElementById('scrollHeader');
    if (!bar) return;

    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      const progress = Math.max(0, Math.min(1, (y - 20) / 110));
      bar.style.opacity = String(progress);
      bar.style.transform = `translateX(-50%) translateY(${(-8 + 8 * progress).toFixed(2)}px)`;
      bar.style.pointerEvents = progress > 0.15 ? 'auto' : 'none';
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  };

  const initSearchTicker = () => {
    const wrap = document.querySelector('.search-roll');
    const track = document.querySelector('.search-roll-track');
    if (!wrap || !track) return;

    const total = track.children.length;
    if (total <= 1) return;

    let index = 0;
    const step = wrap.clientHeight || 18;

    setInterval(() => {
      index = (index + 1) % total;
      track.style.transition = 'transform .45s ease';
      track.style.transform = `translateY(-${index * step}px)`;
    }, 5000);
  };

  const initRecoCarousel = () => {
    const carousel = document.getElementById('recoCarousel');
    const track = carousel?.querySelector('.reco-track');
    if (!carousel || !track) return;

    const slides = Array.from(track.querySelectorAll('.reco-layer'));
    const dots = Array.from(carousel.querySelectorAll('.reco-dot'));
    if (slides.length <= 1) return;

    const clone = slides[0].cloneNode(true);
    clone.classList.remove('is-active');
    clone.classList.add('is-clone');
    clone.setAttribute('aria-hidden', 'true');
    clone.tabIndex = -1;
    track.appendChild(clone);

    const transitionValue = 'transform .78s cubic-bezier(.22,.61,.36,1)';
    const slideCount = slides.length;
    let currentIndex = 0;
    let timerId = 0;

    const updateState = (realIndex) => {
      slides.forEach((slide, index) => {
        slide.classList.toggle('is-active', index === realIndex);
      });
      dots.forEach((dot, index) => {
        const active = index === realIndex;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    };

    const moveTo = (nextIndex, animate = true) => {
      track.style.transition = animate ? transitionValue : 'none';
      track.style.transform = `translateX(-${nextIndex * 100}%)`;
    };

    const stop = () => {
      if (!timerId) return;
      clearInterval(timerId);
      timerId = 0;
    };

    const start = () => {
      stop();
      timerId = window.setInterval(() => {
        currentIndex += 1;
        moveTo(currentIndex, true);
        updateState(currentIndex % slideCount);
      }, 3600);
    };

    const goTo = (nextIndex) => {
      currentIndex = nextIndex;
      moveTo(currentIndex, true);
      updateState(currentIndex % slideCount);
      start();
    };

    track.addEventListener('transitionend', () => {
      if (currentIndex < slideCount) return;
      currentIndex = 0;
      moveTo(currentIndex, false);
      updateState(currentIndex);
    });

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        goTo(index);
      });
    });

    carousel.addEventListener('pointerenter', stop);
    carousel.addEventListener('pointerleave', start);
    carousel.addEventListener('focusin', stop);
    carousel.addEventListener('focusout', start);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stop();
        return;
      }
      start();
    });

    moveTo(0, false);
    updateState(0);
    start();
  };

  const syncTabbarIcons = () => {
    document.querySelectorAll('.tabbar .tab').forEach((tab) => {
      const img = tab.querySelector('img[data-icon-active][data-icon-inactive]');
      if (!img) return;
      img.src = tab.classList.contains('active') ? img.dataset.iconActive : img.dataset.iconInactive;
    });
  };

  const initLaunchScreen = () => {
    const screen = document.getElementById('launchScreen');
    const skip = document.getElementById('launchScreenSkip');
    if (!screen || !skip) return;

    const storageKey = 'tjbank-index-launch-shown';

    try {
      if (window.sessionStorage.getItem(storageKey) === '1') {
        screen.remove();
        return;
      }
      window.sessionStorage.setItem(storageKey, '1');
    } catch (_) {
      // Fall back to showing the launch screen when sessionStorage is unavailable.
    }

    let closed = false;
    let exitTimerId = 0;
    let hideTimerId = 0;

    const cleanup = () => {
      window.clearTimeout(exitTimerId);
      window.clearTimeout(hideTimerId);
      screen.classList.add('is-hidden');
      window.setTimeout(() => screen.remove(), 180);
    };

    const close = () => {
      if (closed) return;
      closed = true;
      skip.style.pointerEvents = 'none';
      screen.classList.add('is-exit');
      cleanup();
    };

    hideTimerId = window.setTimeout(() => {
      skip.setAttribute('aria-hidden', 'true');
      screen.classList.add('is-exit');
    }, 2000);

    exitTimerId = window.setTimeout(() => {
      close();
    }, 2280);

    skip.addEventListener('click', close);
  };

  const initAssetAmountInput = () => {
    const input = document.getElementById('assetAmountInput');
    const submitBtn = document.getElementById('assetAmountSubmit');
    if (!input || !submitBtn) return;

    submitBtn.addEventListener('click', () => {
      const inputValue = input.value.trim();
      const amount = parseFloat(inputValue);

      if (isNaN(amount) || amount < 0) {
        alert('请输入有效的金额数字');
        return;
      }

      const assetValueNodes = document.querySelectorAll('.asset-value-open.asset-value-number');
      assetValueNodes.forEach(node => {
        const prefix = node.dataset.prefix || '';
        const decimals = parseInt(node.dataset.decimals || '2', 10) || 2;
        const formattedValue = amount.toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        });
        node.textContent = `${prefix}${formattedValue}`;
        node.dataset.value = amount.toFixed(decimals);
      });

      input.value = '';
      alert('已更新');
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        submitBtn.click();
      }
    });
  };

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
  }

  initUserNameEyeToggle();
  initAssetVisibilityToggle();
  initScrollHeaderFade();
  initSearchTicker();
  initRecoCarousel();
  syncTabbarIcons();
  initLaunchScreen();
  initAssetAmountInput();

  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-link]');
    if (!target) return;
    e.preventDefault();

    const tab = target.closest('.tab');
    if (tab) {
      document.querySelectorAll('.tab').forEach((n) => n.classList.remove('active'));
      tab.classList.add('active');
      syncTabbarIcons();
    }

    const route = target.getAttribute('data-link');
    const pathMap = {
      fail: 'fail.html',
      mine: 'mine.html',
      home: 'index.html'
    };

    setTimeout(() => {
      window.location.href = pathMap[route] || 'fail.html';
    }, 80);
  });
})();
