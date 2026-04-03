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
      value: totalAssetConfig ? totalAssetConfig.value * (Number.parseFloat(incomeNode.dataset.rate || '0') || 0) / (Number.parseFloat(incomeNode.dataset.days || '365') || 365) : 0,
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

    const animateOpen = () => {
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

    render(false);
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (btn.getAttribute('aria-pressed') === 'true') {
        render(false);
        return;
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
