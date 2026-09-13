/* @ds-bundle: {"format":4,"namespace":"HiLabsDesignSystem_3a8d7a","components":[{"name":"BrandGlyph","sourcePath":"components/brand/BrandGlyph.jsx"},{"name":"Logo","sourcePath":"components/brand/Logo.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Callout","sourcePath":"components/core/Callout.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"DataTable","sourcePath":"components/data/DataTable.jsx"},{"name":"Legend","sourcePath":"components/data/Legend.jsx"},{"name":"ProgressMeter","sourcePath":"components/data/ProgressMeter.jsx"},{"name":"StatCallout","sourcePath":"components/data/StatCallout.jsx"},{"name":"AccentTab","sourcePath":"components/layout/AccentTab.jsx"},{"name":"NumberedList","sourcePath":"components/layout/NumberedList.jsx"},{"name":"PhaseTimeline","sourcePath":"components/layout/PhaseTimeline.jsx"},{"name":"SectionBand","sourcePath":"components/layout/SectionBand.jsx"}],"sourceHashes":{"components/brand/BrandGlyph.jsx":"90edee3e2e26","components/brand/Logo.jsx":"135d4e3387e1","components/core/Badge.jsx":"cd7c4adfd5c2","components/core/Button.jsx":"327ac59fb69c","components/core/Callout.jsx":"d4bdc2a4f126","components/core/Card.jsx":"d81c4ef5b29b","components/data/DataTable.jsx":"cec11a34d469","components/data/Legend.jsx":"306deceb4ade","components/data/ProgressMeter.jsx":"df13727e56fd","components/data/StatCallout.jsx":"3d10b6abc3c9","components/layout/AccentTab.jsx":"8018fa0ab769","components/layout/NumberedList.jsx":"1181c7431927","components/layout/PhaseTimeline.jsx":"b5d8f4e05b87","components/layout/SectionBand.jsx":"c84f40a6b75d","slides/slide-agenda.jsx":"f9d2836f800a","slides/slide-chrome.jsx":"3423d18f03ed","slides/slide-closing.jsx":"596c24fc650e","slides/slide-metrics.jsx":"3958679ec70a","slides/slide-section.jsx":"42f836de26a6","slides/slide-table.jsx":"07f110fa91d4","slides/slide-timeline.jsx":"f01b596a4c70","slides/slide-title.jsx":"c03da4780294"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.HiLabsDesignSystem_3a8d7a = window.HiLabsDesignSystem_3a8d7a || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/brand/BrandGlyph.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const GLYPHS = ['flow', 'burst', 'layers', 'columns', 'stream', 'bars'];
function BrandGlyph({
  name = 'flow',
  size = 48,
  color = 'var(--hl-blue)',
  assetBase = '',
  style,
  ...rest
}) {
  const key = GLYPHS.indexOf(name) === -1 ? 'flow' : name;
  const src = (assetBase ? assetBase.replace(/\/$/, '') + '/' : '') + 'assets/glyph-' + key + '-mono.svg';
  return /*#__PURE__*/React.createElement("span", _extends({
    role: "presentation",
    style: {
      display: 'inline-block',
      width: size,
      height: size,
      backgroundColor: color,
      WebkitMaskImage: 'url(' + src + ')',
      maskImage: 'url(' + src + ')',
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
      WebkitMaskPosition: 'center',
      maskPosition: 'center',
      WebkitMaskSize: 'contain',
      maskSize: 'contain',
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { BrandGlyph });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/BrandGlyph.jsx", error: String((e && e.message) || e) }); }

// components/brand/Logo.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SRC = {
  color: 'assets/logo-hilabs.svg',
  white: 'assets/logo-hilabs-white.svg',
  mono: 'assets/logo-hilabs-mono.svg'
};
const HEIGHT = {
  sm: 20,
  md: 28,
  lg: 48,
  xl: 64
};
function Logo({
  variant = 'color',
  size = 'md',
  assetBase = '',
  color,
  style,
  ...rest
}) {
  const h = typeof size === 'number' ? size : HEIGHT[size] || HEIGHT.md;
  const src = (assetBase ? assetBase.replace(/\/$/, '') + '/' : '') + SRC[variant];
  if (variant === 'mono') {
    return /*#__PURE__*/React.createElement("span", _extends({
      role: "img",
      "aria-label": "HiLabs",
      style: {
        display: 'inline-block',
        height: h,
        width: h * 3.9,
        backgroundColor: color || 'currentColor',
        WebkitMaskImage: 'url(' + src + ')',
        maskImage: 'url(' + src + ')',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        ...style
      }
    }, rest));
  }
  return /*#__PURE__*/React.createElement("img", _extends({
    src: src,
    alt: "HiLabs",
    style: {
      height: h,
      width: 'auto',
      display: 'block',
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Logo.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  good: {
    bg: 'var(--status-good-surface)',
    fg: '#04713A'
  },
  warn: {
    bg: 'var(--status-warn-surface)',
    fg: '#8A5A00'
  },
  bad: {
    bg: 'var(--status-bad-surface)',
    fg: 'var(--status-bad)'
  },
  info: {
    bg: 'var(--status-info-surface)',
    fg: 'var(--blue-700)'
  },
  neutral: {
    bg: 'var(--status-neutral-surface)',
    fg: 'var(--grey-700)'
  },
  solid: {
    bg: 'var(--hl-blue)',
    fg: 'var(--hl-white)'
  },
  dark: {
    bg: 'var(--hl-ink)',
    fg: 'var(--hl-white)'
  }
};
function Badge({
  tone = 'neutral',
  shape = 'pill',
  uppercase,
  children,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.neutral;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-1)',
      fontFamily: 'var(--font-brand)',
      fontWeight: 'var(--weight-bold)',
      fontSize: 'var(--size-micro)',
      lineHeight: 1.2,
      letterSpacing: uppercase ? 'var(--tracking-caps)' : 'var(--tracking-normal)',
      textTransform: uppercase ? 'uppercase' : 'none',
      padding: '4px 10px',
      background: t.bg,
      color: t.fg,
      borderRadius: shape === 'pill' ? 'var(--radius-pill)' : 'var(--radius-sm)',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const PAD = {
  sm: '6px 14px',
  md: '9px 20px',
  lg: '13px 28px'
};
const FS = {
  sm: 'var(--size-caption)',
  md: 'var(--size-body-sm)',
  lg: 'var(--size-body)'
};
const TONES = {
  primary: {
    background: 'var(--hl-blue)',
    color: 'var(--hl-white)',
    border: '1px solid var(--hl-blue)'
  },
  secondary: {
    background: 'transparent',
    color: 'var(--hl-blue)',
    border: '1px solid var(--hl-blue)'
  },
  dark: {
    background: 'var(--hl-ink)',
    color: 'var(--hl-white)',
    border: '1px solid var(--hl-ink)'
  },
  ghost: {
    background: 'transparent',
    color: 'var(--hl-ink)',
    border: '1px solid transparent'
  }
};
function Button({
  variant = 'primary',
  size = 'md',
  disabled,
  block,
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    disabled: disabled,
    style: {
      font: 'inherit',
      fontFamily: 'var(--font-brand)',
      fontWeight: 'var(--weight-medium)',
      fontSize: FS[size],
      lineHeight: 1.2,
      letterSpacing: 'var(--tracking-normal)',
      padding: PAD[size],
      borderRadius: 'var(--radius-pill)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      width: block ? '100%' : undefined,
      transition: 'background var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard)',
      ...TONES[variant],
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Callout.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  info: {
    bar: 'var(--hl-blue)',
    bg: 'var(--status-info-surface)',
    fg: 'var(--blue-800)'
  },
  good: {
    bar: 'var(--status-good)',
    bg: 'var(--status-good-surface)',
    fg: '#04713A'
  },
  warn: {
    bar: 'var(--status-warn)',
    bg: 'var(--status-warn-surface)',
    fg: '#8A5A00'
  },
  bad: {
    bar: 'var(--status-bad)',
    bg: 'var(--status-bad-surface)',
    fg: 'var(--status-bad)'
  },
  dark: {
    bar: 'var(--hl-blue)',
    bg: 'var(--hl-ink)',
    fg: 'var(--hl-white)'
  }
};
function Callout({
  tone = 'info',
  label,
  children,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.info;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      gap: 'var(--space-4)',
      alignItems: 'stretch',
      background: t.bg,
      color: t.fg,
      fontFamily: 'var(--font-brand)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 'var(--border-rule)',
      background: t.bar,
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--space-4) var(--space-4) var(--space-4) 0'
    }
  }, label && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--size-micro)',
      fontWeight: 'var(--weight-bold)',
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      marginBottom: 'var(--space-1)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--size-body-sm)',
      lineHeight: 'var(--leading-normal)'
    }
  }, children)));
}
Object.assign(__ds_scope, { Callout });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Callout.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  plain: {
    background: 'var(--surface-card)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-subtle)'
  },
  outlined: {
    background: 'var(--surface-card)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-default)'
  },
  tinted: {
    background: 'var(--blue-50)',
    color: 'var(--text-primary)',
    border: '1px solid var(--blue-100)'
  },
  dark: {
    background: 'var(--surface-dark)',
    color: 'var(--text-inverse)',
    border: '1px solid var(--surface-dark)'
  }
};
function Card({
  tone = 'plain',
  accent = false,
  title,
  eyebrow,
  children,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.plain;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-5)',
      fontFamily: 'var(--font-brand)',
      boxShadow: 'var(--shadow-card)',
      ...t,
      ...style
    }
  }, rest), accent && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 0,
      top: 'var(--space-5)',
      width: 10,
      height: 26,
      background: 'var(--hl-blue)',
      borderRadius: '0 999px 999px 0'
    }
  }), eyebrow && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--size-micro)',
      fontWeight: 'var(--weight-bold)',
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      color: tone === 'dark' ? 'var(--hl-sky)' : 'var(--hl-blue)',
      marginBottom: 'var(--space-2)'
    }
  }, eyebrow), title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--size-h3)',
      fontWeight: 'var(--weight-bold)',
      lineHeight: 'var(--leading-snug)',
      marginBottom: 'var(--space-2)'
    }
  }, title), children && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--size-body-sm)',
      lineHeight: 'var(--leading-normal)'
    }
  }, children));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/data/DataTable.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CELL_TONES = {
  good: 'var(--status-good-surface)',
  warn: 'var(--status-warn-surface)',
  bad: 'var(--status-bad-surface)',
  info: 'var(--status-info-surface)',
  neutral: 'var(--status-neutral-surface)'
};
function DataTable({
  columns = [],
  rows = [],
  dense = false,
  headerTone = 'dark',
  caption,
  style,
  ...rest
}) {
  const pad = dense ? '5px 8px' : '8px 12px';
  const headBg = headerTone === 'dark' ? 'var(--hl-ink)' : headerTone === 'blue' ? 'var(--hl-blue)' : 'var(--grey-100)';
  const headFg = headerTone === 'light' ? 'var(--text-primary)' : 'var(--hl-white)';
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      fontFamily: 'var(--font-brand)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("table", {
    style: {
      borderCollapse: 'collapse',
      width: '100%',
      fontSize: dense ? 'var(--size-micro)' : 'var(--size-caption)'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map((c, i) => /*#__PURE__*/React.createElement("th", {
    key: i,
    style: {
      background: headBg,
      color: headFg,
      textAlign: c.align || (i === 0 ? 'left' : 'right'),
      fontWeight: 'var(--weight-bold)',
      padding: pad,
      whiteSpace: 'nowrap',
      borderRight: i < columns.length - 1 ? '1px solid rgba(255,255,255,0.18)' : 'none'
    }
  }, c.header)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, ri) => /*#__PURE__*/React.createElement("tr", {
    key: ri,
    style: {
      background: r.tone ? CELL_TONES[r.tone] : ri % 2 ? 'var(--grey-50)' : 'var(--hl-white)'
    }
  }, columns.map((c, ci) => {
    const raw = r.cells ? r.cells[ci] : r[c.key];
    const cell = raw && typeof raw === 'object' && !React.isValidElement(raw) ? raw : {
      value: raw
    };
    return /*#__PURE__*/React.createElement("td", {
      key: ci,
      style: {
        padding: pad,
        textAlign: c.align || (ci === 0 ? 'left' : 'right'),
        color: 'var(--text-primary)',
        fontWeight: ci === 0 ? 'var(--weight-medium)' : 'var(--weight-regular)',
        background: cell.tone ? CELL_TONES[cell.tone] : 'transparent',
        borderBottom: '0.75px solid var(--grey-300)'
      }
    }, cell.value);
  }))))), caption && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-2)',
      fontSize: 'var(--size-footer)',
      color: 'var(--text-secondary)'
    }
  }, caption));
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/data/Legend.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Legend({
  items = [],
  direction = 'row',
  shape = 'square',
  title,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      fontFamily: 'var(--font-brand)',
      ...style
    }
  }, rest), title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--size-micro)',
      fontWeight: 'var(--weight-bold)',
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      color: 'var(--text-secondary)',
      marginBottom: 'var(--space-2)'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: direction === 'column' ? 'column' : 'row',
      flexWrap: 'wrap',
      gap: direction === 'column' ? 'var(--space-2)' : 'var(--space-4)'
    }
  }, items.map((it, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      fontSize: 'var(--size-caption)',
      color: 'var(--text-primary)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: shape === 'bar' ? 20 : 12,
      height: 12,
      flex: '0 0 auto',
      background: it.color,
      borderRadius: shape === 'dot' ? '50%' : shape === 'bar' ? 'var(--radius-pill)' : 'var(--radius-sm)'
    }
  }), it.label))));
}
Object.assign(__ds_scope, { Legend });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Legend.jsx", error: String((e && e.message) || e) }); }

// components/data/ProgressMeter.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ProgressMeter({
  value = 0,
  max = 100,
  label,
  valueLabel,
  tone = 'blue',
  height = 10,
  showTrack = true,
  style,
  ...rest
}) {
  const pct = Math.max(0, Math.min(100, value / max * 100));
  const fill = tone === 'good' ? 'var(--status-good)' : tone === 'warn' ? 'var(--status-warn)' : tone === 'navy' ? 'var(--hl-ink)' : 'var(--hl-blue)';
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      fontFamily: 'var(--font-brand)',
      ...style
    }
  }, rest), (label || valueLabel) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 'var(--space-2)',
      fontSize: 'var(--size-caption)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 'var(--weight-medium)',
      color: 'var(--text-primary)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 'var(--weight-bold)',
      color: fill
    }
  }, valueLabel != null ? valueLabel : Math.round(pct) + '%')), /*#__PURE__*/React.createElement("div", {
    style: {
      height,
      borderRadius: 'var(--radius-pill)',
      background: showTrack ? 'var(--grey-100)' : 'transparent',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: pct + '%',
      height: '100%',
      background: fill,
      borderRadius: 'var(--radius-pill)',
      transition: 'width var(--duration-slow) var(--ease-out)'
    }
  })));
}
Object.assign(__ds_scope, { ProgressMeter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ProgressMeter.jsx", error: String((e && e.message) || e) }); }

// components/data/StatCallout.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  blue: {
    fg: 'var(--hl-blue)',
    bg: 'transparent'
  },
  navy: {
    fg: 'var(--hl-ink)',
    bg: 'transparent'
  },
  good: {
    fg: 'var(--status-good)',
    bg: 'transparent'
  },
  bad: {
    fg: 'var(--status-bad)',
    bg: 'transparent'
  },
  solid: {
    fg: 'var(--hl-white)',
    bg: 'var(--hl-blue)'
  },
  inverse: {
    fg: 'var(--hl-white)',
    bg: 'transparent'
  }
};
const SIZES = {
  sm: 'var(--size-title)',
  md: 'var(--size-display)',
  lg: 'var(--size-hero)'
};
function StatCallout({
  value,
  label,
  caption,
  tone = 'blue',
  size = 'md',
  align = 'left',
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.blue;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      fontFamily: 'var(--font-brand)',
      textAlign: align,
      background: t.bg,
      color: t.fg,
      padding: t.bg === 'transparent' ? 0 : 'var(--space-3) var(--space-4)',
      borderRadius: t.bg === 'transparent' ? 0 : 'var(--radius-md)',
      display: 'inline-block',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: SIZES[size],
      fontWeight: 'var(--weight-black)',
      lineHeight: 'var(--leading-tight)',
      letterSpacing: 'var(--tracking-tight)'
    }
  }, value), label && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-2)',
      fontSize: 'var(--size-body-sm)',
      fontWeight: 'var(--weight-bold)',
      lineHeight: 'var(--leading-snug)',
      color: tone === 'solid' || tone === 'inverse' ? 'inherit' : 'var(--text-primary)'
    }
  }, label), caption && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-1)',
      fontSize: 'var(--size-caption)',
      fontWeight: 'var(--weight-regular)',
      lineHeight: 'var(--leading-normal)',
      color: tone === 'solid' || tone === 'inverse' ? 'inherit' : 'var(--text-secondary)'
    }
  }, caption));
}
Object.assign(__ds_scope, { StatCallout });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatCallout.jsx", error: String((e && e.message) || e) }); }

// components/layout/AccentTab.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function AccentTab({
  side = 'left',
  width = 21,
  height = 47,
  color = 'var(--hl-blue)',
  style,
  ...rest
}) {
  const radius = side === 'left' ? '0 999px 999px 0' : side === 'right' ? '999px 0 0 999px' : side === 'top' ? '0 0 999px 999px' : '999px 999px 0 0';
  return /*#__PURE__*/React.createElement("span", _extends({
    "aria-hidden": "true",
    style: {
      display: 'block',
      width,
      height,
      background: color,
      borderRadius: radius,
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { AccentTab });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/AccentTab.jsx", error: String((e && e.message) || e) }); }

// components/layout/NumberedList.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function NumberedList({
  items = [],
  tone = 'dark',
  size = 'md',
  style,
  ...rest
}) {
  const dia = size === 'lg' ? 34 : size === 'sm' ? 24 : 30;
  const bg = tone === 'blue' ? 'var(--hl-blue)' : tone === 'light' ? 'var(--grey-100)' : 'var(--hl-ink)';
  const fg = tone === 'light' ? 'var(--text-primary)' : 'var(--hl-white)';
  return /*#__PURE__*/React.createElement("ol", _extends({
    style: {
      listStyle: 'none',
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-5)',
      fontFamily: 'var(--font-brand)',
      ...style
    }
  }, rest), items.map((it, i) => {
    const label = typeof it === 'string' ? it : it.label;
    const meta = typeof it === 'string' ? null : it.meta;
    return /*#__PURE__*/React.createElement("li", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-4)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        flex: '0 0 auto',
        width: dia,
        height: dia,
        borderRadius: '50%',
        background: bg,
        color: fg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 'var(--size-body-sm)',
        fontWeight: 'var(--weight-bold)'
      }
    }, i + 1), /*#__PURE__*/React.createElement("span", {
      style: {
        paddingTop: 4,
        fontSize: size === 'lg' ? 'var(--size-h3)' : 'var(--size-body)',
        lineHeight: 'var(--leading-snug)',
        color: 'var(--text-primary)'
      }
    }, label, meta && /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-secondary)',
        fontWeight: 'var(--weight-regular)'
      }
    }, '  ', meta)));
  }));
}
Object.assign(__ds_scope, { NumberedList });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/NumberedList.jsx", error: String((e && e.message) || e) }); }

// components/layout/PhaseTimeline.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function PhaseTimeline({
  periods = [],
  rows = [],
  rowLabelWidth = 150,
  style,
  ...rest
}) {
  const n = periods.length || 1;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      fontFamily: 'var(--font-brand)',
      fontSize: 'var(--size-caption)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: rowLabelWidth + 'px repeat(' + n + ', 1fr)',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null), periods.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      textAlign: 'center',
      fontWeight: 'var(--weight-bold)',
      color: 'var(--text-secondary)',
      padding: '0 0 var(--space-2)'
    }
  }, p))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)'
    }
  }, rows.map((r, ri) => /*#__PURE__*/React.createElement("div", {
    key: ri,
    style: {
      display: 'grid',
      gridTemplateColumns: rowLabelWidth + 'px repeat(' + n + ', 1fr)',
      alignItems: 'center',
      minHeight: 30
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      paddingRight: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 'var(--weight-bold)',
      color: 'var(--text-primary)'
    }
  }, r.label), r.sublabel && /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-secondary)',
      fontSize: 'var(--size-micro)'
    }
  }, r.sublabel)), /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: '2 / -1',
      position: 'relative',
      height: 24
    }
  }, (r.bars || []).map((b, bi) => /*#__PURE__*/React.createElement("div", {
    key: bi,
    style: {
      position: 'absolute',
      top: 0,
      height: 24,
      left: (b.start - 1) / n * 100 + '%',
      width: ((b.end ?? b.start) - b.start + 1) / n * 100 + '%',
      background: b.color || 'var(--hl-blue)',
      color: b.textColor || 'var(--hl-white)',
      borderRadius: 'var(--radius-pill)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'var(--size-micro)',
      fontWeight: 'var(--weight-medium)',
      overflow: 'hidden',
      whiteSpace: 'nowrap'
    }
  }, b.label)))))));
}
Object.assign(__ds_scope, { PhaseTimeline });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/PhaseTimeline.jsx", error: String((e && e.message) || e) }); }

// components/layout/SectionBand.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  dark: {
    bg: 'var(--hl-ink)',
    fg: 'var(--hl-white)'
  },
  black: {
    bg: 'var(--hl-black)',
    fg: 'var(--hl-white)'
  },
  blue: {
    bg: 'var(--hl-blue)',
    fg: 'var(--hl-white)'
  },
  light: {
    bg: 'var(--grey-100)',
    fg: 'var(--text-primary)'
  }
};
function SectionBand({
  tone = 'black',
  align = 'center',
  uppercase = true,
  children,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.black;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: t.bg,
      color: t.fg,
      fontFamily: 'var(--font-brand)',
      fontWeight: 'var(--weight-bold)',
      fontSize: 'var(--size-body-sm)',
      letterSpacing: uppercase ? 'var(--tracking-caps)' : 'var(--tracking-normal)',
      textTransform: uppercase ? 'uppercase' : 'none',
      textAlign: align,
      padding: 'var(--space-3) var(--space-5)',
      lineHeight: 'var(--leading-snug)',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { SectionBand });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/SectionBand.jsx", error: String((e && e.message) || e) }); }

// slides/slide-agenda.jsx
try { (() => {
const {
  NumberedList
} = window.HiLabsDesignSystem_3a8d7a || {};
function AgendaSlide({
  items
}) {
  const list = items || [{
    label: 'Provider Directory Accuracy: Expanding Value and Analytics',
    meta: '(45 mins)'
  }, {
    label: 'Roster Automation: Value and Implementation Ramp Up',
    meta: '(30 mins)'
  }, {
    label: 'Supplemental Data Ingestion: Early Value and Roadmap',
    meta: '(30 mins)'
  }, {
    label: 'Coming Up for Molina <> HiLabs',
    meta: '(15 mins)'
  }];
  return /*#__PURE__*/React.createElement(Slide, null, /*#__PURE__*/React.createElement(SlideTitle, null, "Agenda"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 450,
      top: 170,
      width: 790
    }
  }, /*#__PURE__*/React.createElement(NumberedList, {
    size: "lg",
    items: list
  })), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      left: 60,
      top: 300,
      width: 280,
      height: 120,
      background: 'var(--hl-blue)',
      opacity: 0.14,
      WebkitMaskImage: 'url(' + SLIDE_ASSETS + 'glyph-flow-mono.svg)',
      maskImage: 'url(' + SLIDE_ASSETS + 'glyph-flow-mono.svg)',
      WebkitMaskSize: 'contain',
      maskSize: 'contain',
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat'
    }
  }), /*#__PURE__*/React.createElement(Footer, {
    page: 2
  }));
}
Object.assign(window, {
  AgendaSlide
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "slides/slide-agenda.jsx", error: String((e && e.message) || e) }); }

// slides/slide-chrome.jsx
try { (() => {
const {
  Logo,
  AccentTab
} = window.HiLabsDesignSystem_3a8d7a || {};
const A = '../assets/';

// 1280x720 stage. Every slide renders inside one of these.
function Slide({
  children,
  background = 'var(--hl-white)',
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: 1280,
      height: 720,
      overflow: 'hidden',
      background,
      fontFamily: 'var(--font-brand)',
      color: 'var(--text-primary)',
      ...style
    }
  }, children);
}
function Footer({
  dark,
  page
}) {
  const c = dark ? 'rgba(255,255,255,0.75)' : 'var(--grey-600)';
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 36,
      bottom: 30,
      fontSize: 12,
      color: c
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: A + (dark ? 'logo-hilabs-white.svg' : 'logo-hilabs.svg'),
    style: {
      height: 22,
      display: 'block'
    },
    alt: "HiLabs"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: 88,
      bottom: 32,
      fontSize: 12,
      color: c
    }
  }, "Confidential & Proprietary\xA0 |\xA0 HiLabs 2025"), page != null && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: 36,
      bottom: 32,
      fontSize: 12,
      color: c
    }
  }, page));
}
function SlideTitle({
  children,
  note
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 0,
      top: 37,
      width: 21,
      height: 47,
      background: 'var(--hl-blue)',
      borderRadius: '0 999px 999px 0'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 36,
      top: 30,
      width: 1207,
      minHeight: 60,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--size-title)',
      fontWeight: 700,
      lineHeight: 'var(--leading-tight)'
    }
  }, children), note && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-secondary)',
      marginTop: 8
    }
  }, note)));
}
Object.assign(window, {
  Slide,
  Footer,
  SlideTitle,
  SLIDE_ASSETS: A
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "slides/slide-chrome.jsx", error: String((e && e.message) || e) }); }

// slides/slide-closing.jsx
try { (() => {
const {
  Card,
  Button
} = window.HiLabsDesignSystem_3a8d7a || {};
function ClosingSlide() {
  return /*#__PURE__*/React.createElement(Slide, null, /*#__PURE__*/React.createElement(SlideTitle, null, "Closing thoughts and what's next for Molina and HiLabs"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 36,
      top: 170,
      width: 1207,
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement(Card, {
    tone: "outlined",
    accent: true,
    eyebrow: "What's next",
    title: "Member matching UAT"
  }, "Validation completes 10/10. Full production go-live scheduled 10/29 for all markets."), /*#__PURE__*/React.createElement(Card, {
    tone: "tinted",
    accent: true,
    eyebrow: "Risks",
    title: "Member Match UAT timeline"
  }, "Module deployed 10/03; Azure AI Search access granted 10/07. Validation with Molina IT may incur code change and re-deployment."), /*#__PURE__*/React.createElement(Card, {
    tone: "dark",
    eyebrow: "Upcoming asks",
    title: "Data retention & infra"
  }, "Initiate discussions on data retention period and special DQ rules. Automate manual image transfer to the Molina repository.")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 36,
      top: 470,
      display: 'flex',
      gap: 14,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary"
  }, "Confirm Q4 focus markets"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary"
  }, "Share the testing plan")), /*#__PURE__*/React.createElement(Footer, {
    page: 28
  }));
}
Object.assign(window, {
  ClosingSlide
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "slides/slide-closing.jsx", error: String((e && e.message) || e) }); }

// slides/slide-metrics.jsx
try { (() => {
const {
  StatCallout,
  Callout,
  SectionBand
} = window.HiLabsDesignSystem_3a8d7a || {};
function MetricsSlide() {
  return /*#__PURE__*/React.createElement(Slide, null, /*#__PURE__*/React.createElement(SlideTitle, {
    note: "Note: Statistics at NPI address level and does not include the following markets: VA, OH, TX, NE"
  }, "Directory cleanup shows accuracy improvement \u2014 more action on inaccurates needed"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 36,
      top: 175,
      width: 1207
    }
  }, /*#__PURE__*/React.createElement(SectionBand, {
    tone: "black"
  }, "Q4 2025 improvement initiatives"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 24,
      marginTop: 30
    }
  }, [{
    v: '~11%',
    l: 'Accurates (>75)',
    c: 'Q3 2025 · ~14-22% expected in Q4 2025',
    t: 'blue'
  }, {
    v: '~15%',
    l: 'Auto-terms (0-5)',
    c: 'Q3 2025 · ~6-8% expected in Q4 2025',
    t: 'navy'
  }, {
    v: '~4%',
    l: 'Inconclusives (26-75)',
    c: 'Q3 2025 · ~8-14% expected in Q4 2025',
    t: 'good'
  }].map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      borderTop: '3px solid var(--hl-blue)',
      paddingTop: 20
    }
  }, /*#__PURE__*/React.createElement(StatCallout, {
    value: s.v,
    label: s.l,
    caption: s.c,
    tone: s.t,
    size: "lg"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 24,
      marginTop: 44
    }
  }, /*#__PURE__*/React.createElement(Callout, {
    tone: "info",
    label: "Directory impact"
  }, "Room for ~14-22% additional improvement from action on auto-terms and 6-15s. Q4 overall accuracy improvement from May '24: ~21-23%."), /*#__PURE__*/React.createElement(Callout, {
    tone: "warn",
    label: "Discussion questions"
  }, "Validate focus markets for the Claims Model POC in October; agree the time required for Molina testing and go-ahead."))), /*#__PURE__*/React.createElement(Footer, {
    page: 5
  }));
}
Object.assign(window, {
  MetricsSlide
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "slides/slide-metrics.jsx", error: String((e && e.message) || e) }); }

// slides/slide-section.jsx
try { (() => {
function SectionSlide({
  title = 'Provider Data Accuracy: Expanding Value and Analytics',
  eyebrow
}) {
  return /*#__PURE__*/React.createElement(Slide, {
    background: "var(--hl-ink)"
  }, /*#__PURE__*/React.createElement("img", {
    src: SLIDE_ASSETS + 'glyph-columns.svg',
    alt: "",
    style: {
      position: 'absolute',
      right: -60,
      top: 60,
      height: 600,
      opacity: 0.09
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 100,
      right: 140,
      top: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }
  }, eyebrow && /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--hl-sky)',
      fontSize: 'var(--size-body-sm)',
      fontWeight: 700,
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      marginBottom: 18
    }
  }, eyebrow), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--hl-white)',
      fontSize: 'var(--size-hero)',
      fontWeight: 900,
      lineHeight: 0.95,
      letterSpacing: 'var(--tracking-tight)'
    }
  }, title), /*#__PURE__*/React.createElement("span", {
    style: {
      marginTop: 32,
      width: 96,
      height: 6,
      background: 'var(--hl-blue)',
      borderRadius: 999
    }
  })), /*#__PURE__*/React.createElement(Footer, {
    dark: true
  }));
}
Object.assign(window, {
  SectionSlide
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "slides/slide-section.jsx", error: String((e && e.message) || e) }); }

// slides/slide-table.jsx
try { (() => {
const {
  DataTable,
  Callout,
  Badge
} = window.HiLabsDesignSystem_3a8d7a || {};
function TableSlide() {
  const rows = [['WA', '50%', '54%', '74%', '81%', '82%', {
    value: '33%',
    tone: 'good'
  }], ['NY', '39%', '52%', '56%', '56%', '55%', {
    value: '16%',
    tone: 'good'
  }], ['NM', '27%', '33%', '39%', '42%', '41%', {
    value: '14%',
    tone: 'good'
  }], ['IA', '57%', '67%', '69%', '70%', '70%', {
    value: '13%',
    tone: 'good'
  }], ['MI', '47%', '55%', '63%', '57%', '55%', {
    value: '8%',
    tone: 'warn'
  }], ['SC', '54%', '63%', '59%', '61%', '60%', {
    value: '7%',
    tone: 'warn'
  }], ['UT', '47%', '47%', '52%', '53%', '53%', {
    value: '6%',
    tone: 'warn'
  }], ['MA', '55%', '57%', '57%', '58%', '61%', {
    value: '6%',
    tone: 'warn'
  }]];
  return /*#__PURE__*/React.createElement(Slide, null, /*#__PURE__*/React.createElement(SlideTitle, null, "Higher accuracy improvements in states that are deleting auto-terms"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 36,
      top: 150,
      width: 720
    }
  }, /*#__PURE__*/React.createElement(DataTable, {
    columns: [{
      header: 'Market'
    }, {
      header: "Sep 24'"
    }, {
      header: "Dec 24'"
    }, {
      header: "Mar 25'"
    }, {
      header: "Jun 25'"
    }, {
      header: "Sep 25'"
    }, {
      header: '% Improvement'
    }],
    rows: rows.map(r => ({
      cells: r
    })),
    caption: "Accurates (>75). Markets ordered by improvement since September 2024."
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 800,
      top: 150,
      width: 443,
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Callout, {
    tone: "good",
    label: "Key takeaway"
  }, "Markets that consistently delete auto-terms see the largest improvements in accuracy \u2014 IA deletes over 80% of auto-terms."), /*#__PURE__*/React.createElement(Callout, {
    tone: "warn",
    label: "Markets to review"
  }, "WI and MI have seen only moderate improvement despite deleting auto-terms."), /*#__PURE__*/React.createElement(Callout, {
    tone: "bad",
    label: "Push for heavier deletion"
  }, "CA, KY, IL, MS, FL. KY has deleted roughly 1% of auto-terms."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "good"
  }, ">40% deleted"), /*#__PURE__*/React.createElement(Badge, {
    tone: "warn"
  }, "15-40%"), /*#__PURE__*/React.createElement(Badge, {
    tone: "bad"
  }, "<15%"))), /*#__PURE__*/React.createElement(Footer, {
    page: 9
  }));
}
Object.assign(window, {
  TableSlide
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "slides/slide-table.jsx", error: String((e && e.message) || e) }); }

// slides/slide-timeline.jsx
try { (() => {
const {
  PhaseTimeline,
  Legend,
  Badge
} = window.HiLabsDesignSystem_3a8d7a || {};
function TimelineSlide() {
  const P = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const req = {
    color: 'var(--chart-4)',
    textColor: 'var(--hl-ink)'
  };
  const imp = {
    color: 'var(--chart-1)'
  };
  const uat = {
    color: 'var(--chart-2)'
  };
  return /*#__PURE__*/React.createElement(Slide, null, /*#__PURE__*/React.createElement(SlideTitle, null, "Market rollout timeline \u2014 updated"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 36,
      top: 160,
      width: 1207
    }
  }, /*#__PURE__*/React.createElement(PhaseTimeline, {
    periods: P,
    rowLabelWidth: 210,
    rows: [{
      label: 'Wave 2',
      sublabel: 'IL, MI, NY',
      bars: [{
        start: 1,
        end: 2,
        label: 'Requirements',
        ...req
      }, {
        start: 3,
        end: 5,
        label: 'Implementation',
        ...imp
      }, {
        start: 6,
        end: 7,
        label: 'UAT & launch',
        ...uat
      }]
    }, {
      label: 'Wave 3',
      sublabel: 'ID, KY, MS, WI',
      bars: [{
        start: 3,
        end: 4,
        label: 'Requirements',
        ...req
      }, {
        start: 5,
        end: 7,
        label: 'Implementation',
        ...imp
      }, {
        start: 8,
        end: 9,
        label: 'UAT & launch',
        ...uat
      }]
    }, {
      label: 'Wave 4',
      sublabel: 'MA, IA, NM, AZ, NV',
      bars: [{
        start: 5,
        end: 6,
        label: 'Requirements',
        ...req
      }, {
        start: 7,
        end: 9,
        label: 'Implementation',
        ...imp
      }, {
        start: 10,
        label: 'UAT',
        ...uat
      }]
    }, {
      label: 'Wave 5 & 6',
      sublabel: 'OH, SC, UT, NE, WA, FL',
      bars: [{
        start: 7,
        end: 8,
        label: 'Requirements',
        ...req
      }, {
        start: 9,
        end: 10,
        label: 'Implementation',
        ...imp
      }]
    }, {
      label: 'Planning',
      sublabel: 'CT, GA',
      bars: [{
        start: 9,
        end: 10,
        label: 'Environment set up',
        color: 'var(--chart-7)'
      }]
    }]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginTop: 40
    }
  }, /*#__PURE__*/React.createElement(Legend, {
    title: "Key",
    shape: "bar",
    items: [{
      color: 'var(--chart-4)',
      label: 'Requirements phase'
    }, {
      color: 'var(--chart-1)',
      label: 'Implementation phase'
    }, {
      color: 'var(--chart-2)',
      label: 'UAT & launch'
    }, {
      color: 'var(--chart-7)',
      label: 'Environment set up'
    }]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "info",
    uppercase: true
  }, "Q3 2025"), /*#__PURE__*/React.createElement(Badge, {
    tone: "solid",
    uppercase: true
  }, "Where we are today")))), /*#__PURE__*/React.createElement(Footer, {
    page: 17
  }));
}
Object.assign(window, {
  TimelineSlide
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "slides/slide-timeline.jsx", error: String((e && e.message) || e) }); }

// slides/slide-title.jsx
try { (() => {
const {
  Logo
} = window.HiLabsDesignSystem_3a8d7a || {};
function TitleSlide({
  client = 'Molina <> HiLabs',
  title = 'Q3 2025 — QBR',
  date = 'October 2025'
}) {
  return /*#__PURE__*/React.createElement(Slide, {
    background: "var(--blue-900)"
  }, /*#__PURE__*/React.createElement("img", {
    src: SLIDE_ASSETS + 'bg-network-dark.png',
    alt: "",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--scrim-hero)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 938,
      top: 33,
      width: 317,
      height: 99,
      background: 'var(--hl-white)',
      borderRadius: 'var(--radius-lg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: SLIDE_ASSETS + 'logo-hilabs.svg',
    alt: "HiLabs",
    style: {
      height: 56
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 56,
      top: 260,
      width: 720,
      color: 'var(--hl-white)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--size-hero)',
      fontWeight: 900,
      lineHeight: 0.95,
      letterSpacing: 'var(--tracking-tight)'
    }
  }, client, /*#__PURE__*/React.createElement("br", null), title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--size-subtitle)',
      marginTop: 26,
      opacity: 0.9
    }
  }, date)), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 56,
      bottom: 44,
      display: 'flex',
      alignItems: 'center',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: SLIDE_ASSETS + 'logo-molina.png',
    alt: "Molina Healthcare",
    style: {
      height: 34,
      filter: 'brightness(0) invert(1)',
      opacity: 0.9
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: 36,
      bottom: 32,
      fontSize: 12,
      color: 'rgba(255,255,255,0.75)'
    }
  }, "Confidential & Proprietary\xA0 |\xA0 HiLabs 2025"));
}
Object.assign(window, {
  TitleSlide
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "slides/slide-title.jsx", error: String((e && e.message) || e) }); }

__ds_ns.BrandGlyph = __ds_scope.BrandGlyph;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Callout = __ds_scope.Callout;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.Legend = __ds_scope.Legend;

__ds_ns.ProgressMeter = __ds_scope.ProgressMeter;

__ds_ns.StatCallout = __ds_scope.StatCallout;

__ds_ns.AccentTab = __ds_scope.AccentTab;

__ds_ns.NumberedList = __ds_scope.NumberedList;

__ds_ns.PhaseTimeline = __ds_scope.PhaseTimeline;

__ds_ns.SectionBand = __ds_scope.SectionBand;

})();
