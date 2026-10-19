
// ==========================================================================
// MYDUANG ORIGINAL INTERACTIVE SITE-EXPERIENCE (Scroll, Tilts, Pointer-glow, Ripples, Chapters)
// ==========================================================================
function setupOriginalSiteExperience() {
  let e = document.documentElement;
  let t = window.matchMedia('(prefers-reduced-motion: reduce)');
  let n = window.matchMedia('(hover: hover) and (pointer: fine)');
  let r = document.querySelector('#pause-motion');
  let i = () => !t.matches && !r?.checked;
  let a = 0;
  let o = 0;
  let s = 0;
  let c = 0;
  let l = null;
  let u = null;

  let d = () => {
    l?.style.removeProperty('--tilt-x');
    l?.style.removeProperty('--tilt-y');
    l?.classList.remove('pointer-card');
    l = null;
  };

  let f = () => {
    a = 0;
    let t = e.scrollHeight - window.innerHeight;
    e.style.setProperty('--page-progress', String(t > 0 ? Math.min(1, Math.max(0, window.scrollY / t)) : 0));
    e.classList.toggle('page-scrolled', window.scrollY > 90);
    let n = document.querySelector('.celestial-mark');
    if (n) {
      n.style.setProperty('--parallax', i() ? `${Math.min(window.scrollY, 700) * 0.13}px` : '0px');
    }
  };

  let p = () => {
    a ||= requestAnimationFrame(f);
  };

  let m = (t) => {
    if (!i() || !n.matches || t.pointerType === 'touch') return;
    s = t.clientX;
    c = t.clientY;
    u = t.target instanceof Element ? t.target.closest('.price-card,.approach-grid article,.history-explorer,.sub-option-card') : null;
    if (!o) {
      o = requestAnimationFrame(() => {
        o = 0;
        e.style.setProperty('--pointer-x', `${s}px`);
        e.style.setProperty('--pointer-y', `${c}px`);
        e.classList.add('pointer-present');
        if (l !== u) d();
        l = u;
        if (l) {
          let b = l.getBoundingClientRect();
          let tx = (s - b.left) / b.width;
          let ty = (c - b.top) / b.height;
          l.style.setProperty('--tilt-x', `${(ty - 0.5) * -5}deg`);
          l.style.setProperty('--tilt-y', `${(tx - 0.5) * 5}deg`);
          l.style.setProperty('--card-x', `${tx * 100}%`);
          l.style.setProperty('--card-y', `${ty * 100}%`);
          l.classList.add('pointer-card');
        }
      });
    }
  };

  let h = () => {
    cancelAnimationFrame(o);
    o = 0;
    d();
    e.classList.remove('pointer-present');
  };

  let g = (e) => {
    if (!i()) return;
    let t = e.target instanceof Element ? e.target.closest('.button,.era-controls button,.planet-controls button,.era-footer button') : null;
    if (!t || (t instanceof HTMLButtonElement && t.disabled)) return;
    let n = t.getBoundingClientRect();
    let r = document.createElement('span');
    r.className = 'click-ripple';
    r.setAttribute('aria-hidden', 'true');
    r.style.left = `${e.detail === 0 ? n.width / 2 : e.clientX - n.left}px`;
    r.style.top = `${e.detail === 0 ? n.height / 2 : e.clientY - n.top}px`;
    t.appendChild(r);
    r.addEventListener('animationend', () => r.remove(), { once: true });
  };

  // IntersectionObserver for entrance animations on scroll
  let enterElements = Array.from(document.querySelectorAll('.approach-grid article,.price-card,.steps-grid article,.reading-note,.history-intro,.history-chapter,.sub-option-card'));
  let v = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (i()) entry.target.classList.add('enter-view');
        v.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  enterElements.forEach((el) => v.observe(el));

  let x = () => {
    if (!i()) {
      h();
      document.querySelectorAll('.click-ripple').forEach((el) => el.remove());
    }
    f();
  };

  window.addEventListener('scroll', p, { passive: true });
  window.addEventListener('resize', p, { passive: true });
  window.addEventListener('pointermove', m, { passive: true });
  document.addEventListener('pointerleave', h);
  document.addEventListener('click', g);
  r?.addEventListener('change', x);
  t.addEventListener('change', x);
  f();
}


// ==========================================================================
// MYDUANG CLONE: WEEKDAY PLANETS & HISTORY INTERACTIVE CONTROLLER
// ==========================================================================
const WEEKDAY_PLANETS_DATA = [
  {
    day: 'อาทิตย์',
    number: '๑',
    planet: 'พระอาทิตย์ (พลังแห่งผู้นำและแสงสว่าง)',
    symbol: '☉',
    color: '#f87171',
    element: 'ธาตุไฟ (เพลิงสุริยะ)',
    luckyColor: 'สีแดง, สีทอง, สีเขียว',
    luckyNumber: '1, 4, 5, 9',
    theme: 'โดดเด่น มีเกียรติยศ มุ่งมั่นแรงกล้า และรักศักดิ์ศรี',
    nature: 'คนเกิดวันอาทิตย์ได้รับพลังจากดวงตราพญาราชสีห์ มีความเป็นผู้นำสูง รักอิสระ คิดเร็วทำเร็ว จริงใจต่อคนรอบข้าง เมื่อตั้งเป้าหมายแล้วจะพุ่งชนด้วยความมุ่งมั่นไม่ย่อท้อ',
    strengths: ['กล้าตัดสินใจ เด็ดเดี่ยว และพึ่งพาตัวเองได้ดีเยี่ยม', 'มีบารมีผู้ใหญ่อุปถัมภ์ คิดการใหญ่และมองการณ์ไกล', 'ใจกว้าง จริงใจ ไม่ชอบเอาเปรียบใคร'],
    cautions: ['ใจร้อน วู่วาม และเชื่อมั่นในตัวเองสูงจนบางครั้งดูดื้อรั้น', 'เสียเงินง่ายเพราะความใจป้ำหรือหน้าใหญ่ใจโต', 'คำพูดตรงไปตรงมาเกินไปอาจทำให้คนใกล้ตัวน้อยใจ'],
    reflection: 'เสริมดวงด้วยการทำบุญเกี่ยวกับแสงสว่าง เติมน้ำมันตะเกียง หรือถวายหลอดไฟ และฝึกใจเย็นนับ 1-10 ก่อนตัดสินใจเรื่องใหญ่ จะช่วยให้การเงินและบารมีพุ่งทะยานไร้เทียมทาน!'
  },
  {
    day: 'จันทร์',
    number: '๒',
    planet: 'พระจันทร์ (พลังแห่งเสน่ห์เมตตามหานิยม)',
    symbol: '☽',
    color: '#fde047',
    element: 'ธาตุดิน (แผ่นดินอุดมทรัพย์)',
    luckyColor: 'สีเหลืองนวล, สีขาว, สีม่วง',
    luckyNumber: '2, 4, 6, 7',
    theme: 'อ่อนโยน มีเสน่ห์ดึงดูดใจ ช่างสังเกต และประณีตละเอียดอ่อน',
    nature: 'คนเกิดวันจันทร์เปรียบเสมือนแสงจันทร์คืนเพ็ญที่ให้ความร่มเย็น มีเสน่ห์เมตตามหานิยมสูง ไปที่ไหนใครก็รักใคร่เอ็นดู เข้าใจความรู้สึกของผู้อื่นได้อย่างลึกซึ้ง',
    strengths: ['มีเสน่ห์ในการเจรจา คนรอบข้างพร้อมช่วยเหลือเกื้อกูล', 'ละเอียดรอบคอบ มีรสนิยมดี และใส่ใจคนรักเก่งมาก', 'ปรับตัวเข้ากับสังคมได้ดี ประนีประนอมเก่ง'],
    cautions: ['ขี้ใจน้อย คิดมาก และเก็บคำพูดคนอื่นมาคิดซ้ำๆ', 'ลังเลตัดสินใจไม่เด็ดขาดเพราะกลัวคนอื่นเสียใจ', 'อารมณ์อ่อนไหวง่ายตามบรรยากาศรอบตัว'],
    reflection: 'เสริมดวงด้วยการทำบุญเกี่ยวกับน้ำดื่มสะอาด หรือบริจาคสิ่งของช่วยเหลือเด็กและผู้หญิง พร้อมพกเครื่องประดับสีเงินหรือมุก จะช่วยเปิดทางโชคลาภก้อนโต!'
  },
  {
    day: 'อังคาร',
    number: '๓',
    planet: 'พระอังคาร (พลังนักสู้ผู้พิชิตชัยชนะ)',
    symbol: '♂',
    color: '#f472b6',
    element: 'ธาตุลม (พายุหมุนแห่งความกล้า)',
    luckyColor: 'สีชมพู, สีส้ม, สีดำ',
    luckyNumber: '3, 5, 6, 8',
    theme: 'กล้าหาญ ลุยไม่ถอย ตรงไปตรงมา และเปี่ยมด้วยพลังสร้างสรรค์',
    nature: 'คนเกิดวันอังคารมีหัวใจนักรบที่เข้มแข็ง ไม่กลัวความยากลำบาก ยิ่งเจอโจทย์ยากยิ่งฮึดสู้ มีพลังในการบุกเบิกสิ่งใหม่ๆ และมีความจริงใจระดับร้อยเปอร์เซ็นต์',
    strengths: ['อดทนสู้งานหนัก ล้มแล้วลุกไว ไม่ยอมแพ้ต่อโชคชะตา', 'คล่องแคล่ว ว่องไว แก้ปัญหาเฉพาะหน้าได้เฉียบขาด', 'รักเพื่อนพ้องและปกป้องคนที่ตัวเองรักสุดตัว'],
    cautions: ['อารมณ์ร้อน โกรธง่ายหายเร็ว แต่คำพูดตอนโกรธอาจรุนแรง', 'ไม่ชอบการถูกบังคับหรือสั่งการแบบไร้เหตุผล', 'ตัดสินใจเร็วเกินไปในเรื่องการเงินหรือความรัก'],
    reflection: 'เสริมดวงด้วยการทำบุญไถ่ชีวิตสัตว์ หรือบริจาคโลหิต และสวมใส่โทนสีชมพูหรือโรสโกลด์เพื่อเพิ่มความอ่อนโยน จะดึงดูดทั้งทรัพย์และคนรักที่ดีเข้ามา!'
  },
  {
    day: 'พุธ',
    number: '๔',
    planet: 'พระพุธ (พลังแห่งปัญญาและการเจรจาพารวย)',
    symbol: '☿',
    color: '#4ade80',
    element: 'ธาตุน้ำ (สายน้ำแห่งไหวพริบ)',
    luckyColor: 'สีเขียวเหนี่ยวทรัพย์, สีเหลือง, สีฟ้า',
    luckyNumber: '4, 2, 5, 9',
    theme: 'ไหวพริบเป็นเลิศ สื่อสารเก่ง ค้าขายรุ่งเรือง และปรับตัวไว',
    nature: 'คนเกิดวันพุธคือเจ้าของวาทศิลป์และสติปัญญาที่เฉียบแหลม เรียนรู้สิ่งใหม่ได้รวดเร็ว มีหัวการค้าและการติดต่อสื่อสารที่เป็นเลิศ เปลี่ยนวิกฤตให้เป็นโอกาสได้เสมอ',
    strengths: ['พูดจาเป็นเงินเป็นทอง เจรจาต่อรองหรือปิดการขายเก่งมาก', 'มีไอเดียสร้างสรรค์ ทันสมัย และเข้ากับคนได้ทุกกลุ่ม', 'แก้ปัญหาด้วยเหตุผลและชั้นเชิงที่นุ่มนวล'],
    cautions: ['คิดหลายเรื่องพร้อมกันจนบางครั้งจับต้นชนปลายไม่ถูก', 'ขี้เบื่อง่ายเมื่อต้องทำอะไรซ้ำๆ จำเจเป็นเวลานาน', 'ใจอ่อนเชื่อคนง่ายหากถูกพูดจาหว่านล้อม'],
    reflection: 'เสริมดวงด้วยการทำบุญถวายหนังสือเรียน อุปกรณ์การศึกษา หรือปลูกต้นไม้มงคล จะช่วยเสริมให้คำพูดมีพลังดึงดูดเงินล้านและผู้ใหญ่เมตตา!'
  },
  {
    day: 'พฤหัสบดี',
    number: '๕',
    planet: 'พระพฤหัสบดี (พลังแห่งคุรุเทวาและสติปัญญา)',
    symbol: '♃',
    color: '#fb923c',
    element: 'ธาตุดิน (ภูผาแห่งปัญญาและคุณธรรม)',
    luckyColor: 'สีส้ม, สีทอง, สีแดง, สีขาว',
    luckyNumber: '5, 1, 3, 9',
    theme: 'มีสติปัญญา สุขุมรอบคอบ ยุติธรรม และมีดวงผู้ใหญ่อุปถัมภ์',
    nature: 'คนเกิดวันพฤหัสบดีได้รับอิทธิพลจากดาวครู มีความใฝ่รู้ มีเหตุผล และยึดมั่นในความถูกต้อง เป็นที่พึ่งพิงและที่ปรึกษาที่ดีให้กับคนรอบข้างเสมอ',
    strengths: ['วางแผนชีวิตและการงานอย่างเป็นระบบ มั่นคงระยะยาว', 'มีสิ่งศักดิ์สิทธิ์และผู้ใหญ่คอยคุ้มครองช่วยเหลือเมื่อมีภัย', 'มีเมตตาธรรม ซื่อสัตย์ และน่าเชื่อถือสูงมาก'],
    cautions: ['จริงจังกับชีวิตและกฎเกณฑ์มากเกินไปจนเกิดความเครียดสะสม', 'ขี้เกรงใจและชอบแบกรับปัญหาของคนอื่นมาคิดแทน', 'เปิดใจเรื่องความรักช้าเพราะคิดวิเคราะห์ละเอียดทุกมุม'],
    reflection: 'เสริมดวงด้วยการทำบุญตักบาตร ถวายสังฆทานยา หรือช่วยเหลือโรงพยาบาลสงฆ์ จะช่วยเปิดดวงโชคลาภและการเลื่อนขั้นเลื่อนตำแหน่งอย่างรวดเร็ว!'
  },
  {
    day: 'ศุกร์',
    number: '๖',
    planet: 'พระศุกร์ (พลังแห่งโภคทรัพย์และความรื่นรมย์)',
    symbol: '♀',
    color: '#38bdf8',
    element: 'ธาตุน้ำ (สายฝนแห่งความสุขและทรัพย์สิน)',
    luckyColor: 'สีฟ้า, สีน้ำเงิน, สีชมพู, สีขาว',
    luckyNumber: '6, 2, 3, 5',
    theme: 'รสนิยมเลิศ ดวงการเงินและความรักโดดเด่น มีเสน่ห์น่าค้นหา',
    nature: 'คนเกิดวันศุกร์คือตัวแทนแห่งความสุข ศิลปะ และโภคทรัพย์ ชอบความสวยงาม มีอารมณ์สุนทรีย์ หาเงินเก่งและรู้วิธีใช้เงินซื้อความสุขให้ตัวเองและคนที่รัก',
    strengths: ['มีดวงโชคลาภและการเงินหมุนเวียนดี หาช่องทางทำเงินเก่ง', 'มีเสน่ห์ดึงดูดเพศตรงข้ามและมิตรสหายสูงมาก', 'มองโลกในแง่บวก สร้างรอยยิ้มและพลังบวกให้คนรอบตัว'],
    cautions: ['เปย์เก่ง ช้อปปิ้งตามอารมณ์จนบางเดือนเก็บเงินไม่อยู่', 'ทุ่มเทให้ความรักมากจนบางครั้งลืมรักตัวเอง', 'ชอบความสบายจนอาจผัดวันประกันพรุ่งในเรื่องที่ไม่อยากทำ'],
    reflection: 'เสริมดวงด้วยการทำบุญถวายของหอม ดอกไม้สด หรือเสื้อผ้าเครื่องนุ่งห่ม และแบ่งเงินออมทันทีที่ได้รายรับ จะช่วยให้ร่ำรวยมั่งคั่งแบบฉุดไม่อยู่!'
  },
  {
    day: 'เสาร์',
    number: '๗',
    planet: 'พระเสาร์ (พลังแห่งความมั่งคั่งมั่นคงและเด็ดเดี่ยว)',
    symbol: '♄',
    color: '#c084fc',
    element: 'ธาตุไฟ (ไฟหลอมเพชรแห่งความสำเร็จ)',
    luckyColor: 'สีม่วง, สีดำ, สีทอง, สีฟ้า',
    luckyNumber: '7, 8, 9, 1',
    theme: 'หนักแน่น อดทนเป็นเลิศ สร้างฐานะด้วยลำแข้ง และมั่งคั่งในระยะยาว',
    nature: 'คนเกิดวันเสาร์เปรียบดั่งเพชรที่ผ่านแรงกดดันจนส่องประกายล้ำค่า มีความอดทนสูงมาก สุขุมลุ่มลึก ไม่ชอบพึ่งพาใคร มักสร้างเนื้อสร้างตัวจนมีทรัพย์สินที่ดินมั่นคง',
    strengths: ['มีความรับผิดชอบสูง งานยากแค่ไหนก็ทำจนสำเร็จลุล่วง', 'เก็บเงินและบริหารทรัพย์สินระยะยาวได้ดี มีเกณฑ์ได้ทรัพย์ใหญ่', 'รักใครรักจริง มั่นคง และไม่โลเล'],
    cautions: ['เก็บความรู้สึกเก่ง เครียดเงียบๆ คนเดียวไม่ค่อยเล่าให้ใครฟัง', 'ระแวงหรือคิดเผื่อแง่ลบมากเกินไปจนไม่กล้าลองสิ่งใหม่', 'ดื้อเงียบ ใครบังคับไม่ได้ถ้ายังไม่เห็นด้วยจากใจ'],
    reflection: 'เสริมดวงด้วยการทำบุญสร้างวิหารทาน ร่วมสร้างโบสถ์ วิหาร หรือชำระหนี้สงฆ์ จะช่วยสลายเคราะห์กรรมและดึงดูดโชคลาภก้อนใหญ่เข้ามาในชีวิต!'
  }
];

function initMyDuangFeatures() {
  setupOriginalSiteExperience();
  // 1. Weekday Guide Controller
  const weekdayButtons = document.querySelectorAll('#weekday-picks button');
  const readingBox = document.getElementById('weekday-reading');
  const sealSymbol = document.getElementById('w-symbol');
  const sealNum = document.getElementById('w-num');
  const eyebrow = document.getElementById('w-eyebrow');
  const planetTitle = document.getElementById('w-planet');
  const theme = document.getElementById('w-theme');
  const nature = document.getElementById('w-nature');
  const strengthsUl = document.getElementById('w-strengths');
  const cautionsUl = document.getElementById('w-cautions');
  const reflection = document.getElementById('w-reflection');
  const elementEl = document.getElementById('w-element');
  const luckyColorEl = document.getElementById('w-lucky-color');
  const luckyNumEl = document.getElementById('w-lucky-num');

  weekdayButtons.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      weekdayButtons.forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');

      const data = WEEKDAY_PLANETS_DATA[idx];
      if (!data) return;

      if (readingBox) readingBox.style.setProperty('--day-color', data.color);
      if (sealSymbol) sealSymbol.textContent = data.symbol;
      if (sealNum) sealNum.textContent = data.number;
      if (eyebrow) eyebrow.textContent = `ดาวประจำวัน${data.day} · ${data.element}`;
      if (planetTitle) planetTitle.textContent = data.planet;
      if (theme) theme.textContent = data.theme;
      if (nature) nature.textContent = data.nature;
      if (reflection) reflection.textContent = data.reflection;
      if (elementEl && data.element) elementEl.textContent = data.element;
      if (luckyColorEl && data.luckyColor) luckyColorEl.textContent = data.luckyColor;
      if (luckyNumEl && data.luckyNumber) luckyNumEl.textContent = data.luckyNumber;

      if (strengthsUl) {
        strengthsUl.innerHTML = data.strengths.map(s => `<li>${s}</li>`).join('');
      }
      if (cautionsUl) {
        cautionsUl.innerHTML = data.cautions.map(c => `<li>${c}</li>`).join('');
      }

      // Re-trigger animation
      const inner = document.getElementById('weekday-reading-content');
      if (inner) {
        inner.style.animation = 'none';
        inner.offsetHeight; // trigger reflow
        inner.style.animation = '0.35s ease-out weekday-arrive';
      }
    });
  });

  // 2. History Explorer Controller
  let currentEraIndex = 0;
  const eraButtons = document.querySelectorAll('.era-controls button');
  const eraIndexEl = document.getElementById('era-index-num');
  const eraKindEl = document.getElementById('era-kind');
  const eraTitleEl = document.getElementById('era-title');
  const eraDescEl = document.getElementById('era-desc');
  const eraPageIndicator = document.getElementById('era-page-indicator');
  const btnEraPrev = document.getElementById('btn-era-prev');
  const btnEraNext = document.getElementById('btn-era-next');

  function renderEra(index) {
    if (index < 0 || index >= HISTORY_ERAS_DATA.length) return;
    currentEraIndex = index;
    const data = HISTORY_ERAS_DATA[index];

    eraButtons.forEach((btn, i) => {
      btn.setAttribute('aria-pressed', i === index ? 'true' : 'false');
    });

    if (eraIndexEl) eraIndexEl.textContent = data.index;
    if (eraKindEl) eraKindEl.textContent = data.kind;
    if (eraTitleEl) eraTitleEl.textContent = data.title;
    if (eraDescEl) eraDescEl.textContent = data.desc;
    if (eraPageIndicator) eraPageIndicator.textContent = `${index + 1} / ${HISTORY_ERAS_DATA.length}`;

    if (btnEraPrev) btnEraPrev.disabled = (index === 0);
    if (btnEraNext) btnEraNext.disabled = (index === HISTORY_ERAS_DATA.length - 1);
  }

  eraButtons.forEach((btn, idx) => {
    btn.addEventListener('click', () => renderEra(idx));
  });

  if (btnEraPrev) {
    btnEraPrev.addEventListener('click', () => renderEra(currentEraIndex - 1));
  }
  if (btnEraNext) {
    btnEraNext.addEventListener('click', () => renderEra(currentEraIndex + 1));
  }

  // 3. Pointer Glow & Reading Progress
  window.addEventListener('mousemove', (e) => {
    document.documentElement.style.setProperty('--pointer-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--pointer-y', `${e.clientY}px`);
  }, { passive: true });

  const progressEl = document.getElementById('reading-progress');
  const backToTopBtn = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const progress = Math.min(1, Math.max(0, window.scrollY / totalHeight));
      if (progressEl) progressEl.style.transform = `scaleX(${progress})`;
    }

    if (backToTopBtn) {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  }, { passive: true });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 4. Motion toggle
  const motionCheck = document.getElementById('pause-motion');
  if (motionCheck) {
    motionCheck.addEventListener('change', () => {
      if (motionCheck.checked) {
        document.body.classList.add('reduce-motion');
      } else {
        document.body.classList.remove('reduce-motion');
      }
    });
  }
}

import { StarBg } from './particles.js';
import MysticAudio from './audio.js';
import { ESIIMSI_DATA, TAROT_CARDS, PARTY_QUESTIONS, KING_COMMANDS } from './fortuneData.js';
import { calculateCompatibility, GameWheel, analyzeNumbers, calculateZodiacMatch, getZodiacAndElement } from './games.js';

// Dynamically import Socket.io with fallback to allow offline standalone play
let io;
import('https://cdn.socket.io/4.7.5/socket.io.esm.min.js')
  .then(socketModule => {
    io = socketModule.io;
  })
  .catch(e => {
    console.warn('Socket.io failed to load from CDN. Online multiplayer will be disabled. Error:', e);
  });


// ==========================================================================
// Application State
// ==========================================================================
const AppState = {
  currentView: 'sec-lobby',
  soloCategory: 'gag', // 'gag', 'inspiration', 'serious'
  tarotSelection: [], // Array of selected cards { cardInfo, flipped: false }
  
  // Online Multiplayer State
  socket: null,
  isHost: false,
  roomCode: '',
  playerName: '',
  playersList: [], // Array of { name, id }
  activeGame: '', // 'wheel', 'compatibility', 'likely', 'king'
  onlineVotes: {}, // { [playerId]: count }
  
  // Offline State
  offlinePlayers: [], // Array of strings (names)
  offlineWheel: null,
  hostWheel: null
};

// ==========================================================================
// UI DOM Elements
// ==========================================================================
const sections = {
  welcome: document.getElementById('sec-welcome'),
  lobby: document.getElementById('sec-lobby'),
  esiimsi: document.getElementById('sec-esiimsi'),
  tarot: document.getElementById('sec-tarot'),
  numeric: document.getElementById('sec-numeric'),
  zodiacMatch: document.getElementById('sec-zodiac-match'),
  zodiacReading: document.getElementById('sec-zodiac-reading'),
  consult: document.getElementById('sec-consult'),
  dream: document.getElementById('sec-dream'),
  outfit: document.getElementById('sec-outfit'),
  lifegraph: document.getElementById('sec-lifegraph'),
  chatbot: document.getElementById('sec-chatbot'),
  onlineHost: document.getElementById('sec-online-host'),
  playerJoin: document.getElementById('sec-player-join'),
  offlineGame: document.getElementById('sec-offline-game'),
  rekindle: document.getElementById('sec-rekindle'),
  moveon: document.getElementById('sec-moveon')
};

// ==========================================================================
// ==========================================================================
// Routing / View Swapper
// ==========================================================================
function showSection(sectionId) {
  const mainEl = document.getElementById('main');
  const footerEl = document.querySelector('.footer');

  // Returning to main lobby
  if (sectionId === 'sec-lobby' || sectionId === 'main') {
    Object.values(sections).forEach(sec => {
      if (sec) {
        sec.classList.add('hidden');
        sec.classList.remove('active');
      }
    });
    if (mainEl) mainEl.classList.remove('hidden');
    if (footerEl) footerEl.classList.remove('hidden');
    AppState.currentView = 'sec-lobby';

    const divinationsSec = document.getElementById('interactive-divinations');
    if (divinationsSec) {
      divinationsSec.scrollIntoView({ behavior: 'smooth' });
    }
    return;
  }

  // Entering an interactive divination/game sub-view
  if (mainEl) mainEl.classList.add('hidden');
  if (footerEl) footerEl.classList.add('hidden');

  // Hide all divination sections
  Object.values(sections).forEach(sec => {
    if (sec) {
      sec.classList.add('hidden');
      sec.classList.remove('active');
    }
  });

  // Show target section
  const target = document.getElementById(sectionId);
  if (target) {
    target.classList.remove('hidden');
    setTimeout(() => {
      target.classList.add('active');
    }, 50);
    AppState.currentView = sectionId;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}

// ==========================================================================
// Sound Synthesizer Initialization
// ==========================================================================
const audioToggleBtn = document.getElementById('audio-toggle-btn');
export function updateAudioButtonUI(isPlaying) {
  const textEl = audioToggleBtn.querySelector('.audio-text');
  const iconEl = audioToggleBtn.querySelector('.audio-icon');
  if (textEl) {
    textEl.textContent = isPlaying ? 'ปิดเสียงเพลง' : 'เปิดเสียงเพลง';
  }
  if (iconEl) {
    iconEl.textContent = isPlaying ? '🔊' : '🔇';
  }
  if (isPlaying) {
    audioToggleBtn.classList.add('playing');
  } else {
    audioToggleBtn.classList.remove('playing');
  }
}
window.updateAudioButtonUI = updateAudioButtonUI;

audioToggleBtn.addEventListener('click', () => {
  MysticAudio.init();
  const isPlaying = MysticAudio.toggleBackgroundMusic();
  updateAudioButtonUI(isPlaying);
});

// Click sounds for buttons
document.querySelectorAll('button, .mode-card, .sub-option-card, .game-select-card').forEach(el => {
  el.addEventListener('click', () => {
    MysticAudio.playClick();
  });
});

// ==========================================================================
// NAVIGATION BINDINGS
// ==========================================================================
// Welcome screen portal enter trigger
document.getElementById('btn-enter-land')?.addEventListener('click', () => {
  // Play BGM automatically on this click
  MysticAudio.init();
  if (!MysticAudio.isBgPlaying) {
    const isPlaying = MysticAudio.toggleBackgroundMusic();
    updateAudioButtonUI(isPlaying);
  }
  // Transition to main lobby
  showSection('sec-lobby');
});

document.getElementById('btn-start-dream').addEventListener('click', () => {
  showSection('sec-dream');
  document.getElementById('dream-result-box').classList.add('hidden');
  document.getElementById('input-dream-keyword').value = '';
});

document.getElementById('btn-start-outfit').addEventListener('click', () => {
  showSection('sec-outfit');
  document.getElementById('outfit-result-box').classList.add('hidden');
});

document.getElementById('btn-start-lifegraph').addEventListener('click', () => {
  showSection('sec-lifegraph');
  document.getElementById('lifegraph-result-box').classList.add('hidden');
});

document.getElementById('btn-start-chatbot').addEventListener('click', () => {
  showSection('sec-chatbot');
  resetChatMessages();
});

document.querySelectorAll('.btn-back-lobby').forEach(btn => {
  btn.addEventListener('click', () => {
    // If online socket is open, disconnect
    if (AppState.socket) {
      AppState.socket.disconnect();
      AppState.socket = null;
    }
    showSection('sec-lobby');
  });
});

document.querySelectorAll('.btn-back-solo').forEach(btn => {
  btn.addEventListener('click', () => showSection('sec-lobby'));
});

// Hero Highlight Pills: directly launch target divination feature
document.querySelectorAll('.pam-pill[data-open-target]').forEach(pill => {
  pill.addEventListener('click', () => {
    const targetId = pill.getAttribute('data-open-target');
    const targetBtn = targetId ? document.getElementById(targetId) : null;
    if (targetBtn) {
      targetBtn.click();
    }
  });
});

// Top Header Navigation: ensure clicking header links while inside a sub-section returns to main page first
document.querySelectorAll('.site-header a').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href') || '';
    if (AppState.currentView !== 'sec-lobby' && href.startsWith('#')) {
      e.preventDefault();
      const mainEl = document.getElementById('main');
      const footerEl = document.querySelector('.footer');
      Object.values(sections).forEach(sec => {
        if (sec) {
          sec.classList.add('hidden');
          sec.classList.remove('active');
        }
      });
      if (mainEl) mainEl.classList.remove('hidden');
      if (footerEl) footerEl.classList.remove('hidden');
      AppState.currentView = 'sec-lobby';

      if (href === '#' || href === '#main') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const dest = document.querySelector(href);
        if (dest) dest.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

// ==========================================================================
// SOLO HOROSCOPE CATEGORIES
// ==========================================================================
const categoryButtons = document.querySelectorAll('.cat-btn');
categoryButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    categoryButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    AppState.soloCategory = btn.dataset.category;
  });
});

// ==========================================================================
// ESIIMSI PLAYGROUND (เซียมซี)
// ==========================================================================
document.getElementById('btn-start-esiimsi').addEventListener('click', () => {
  showSection('sec-esiimsi');
});

const shakeEsiimsiBtn = document.getElementById('btn-shake-esiimsi');
const esiimsiCupAnim = document.getElementById('esiimsi-cup-anim');

shakeEsiimsiBtn.addEventListener('click', () => {
  shakeEsiimsiBtn.disabled = true;
  
  // Play shake sound effects
  MysticAudio.playShake();
  
  // Shake animation
  esiimsiCupAnim.classList.add('shake-animation');
  
  setTimeout(() => {
    esiimsiCupAnim.classList.remove('shake-animation');
    
    // Choose random fortune
    const randomIdx = Math.floor(Math.random() * ESIIMSI_DATA.length);
    const fortune = ESIIMSI_DATA[randomIdx];
    
    // Fill result modal
    document.getElementById('esiimsi-result-num').textContent = `ใบที่ ${fortune.number}`;
    document.getElementById('esiimsi-result-title').textContent = fortune.title;
    
    // Get text by selected category
    let text = fortune.gag;
    if (AppState.soloCategory === 'inspiration') text = fortune.inspiration;
    else if (AppState.soloCategory === 'serious') text = fortune.serious;
    
    document.getElementById('esiimsi-result-desc').textContent = text;
    
    // Open modal
    openModal('esiimsi');
    shakeEsiimsiBtn.disabled = false;
  }, 1600);
});

// ==========================================================================
// TAROT PLAYGROUND (ไพ่ยิปซี 3 ใบ)
// ==========================================================================
document.getElementById('btn-start-tarot').addEventListener('click', () => {
  showSection('sec-tarot');
  resetTarotGame();
});

function resetTarotGame() {
  AppState.tarotSelection = [];
  document.getElementById('tarot-slots-container').classList.add('hidden');
  document.getElementById('tarot-result-actions').classList.add('hidden');
  document.getElementById('tarot-spread-board').classList.remove('hidden'); // Ensure board is visible
  document.getElementById('tarot-deck').classList.remove('hidden');
  document.getElementById('tarot-instructions').textContent = 'ทำจิตใจให้สงบ จากนั้นคลิกเลือกไพ่ทั้งหมด 3 ใบเพื่อดูผลอดีต ปัจจุบัน และอนาคต';
  
  // Clear slots
  document.getElementById('slot-1').innerHTML = '';
  document.getElementById('slot-2').innerHTML = '';
  document.getElementById('slot-3').innerHTML = '';

  // Generate 35 random cards (using duplicate/repeated cards since TAROT_CARDS has 12 items)
  const shuffledCards = [];
  for (let i = 0; i < 35; i++) {
    const randomCard = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
    shuffledCards.push(randomCard);
  }

  const deckContainer = document.getElementById('tarot-deck');
  deckContainer.innerHTML = '';

  const N = shuffledCards.length;
  const vw = window.innerWidth;
  const isCompact = vw <= 768;
  const R = isCompact ? Math.max(95, Math.min(165, Math.floor((vw - 86) / 2))) : 240;
  const baseY = isCompact ? R + 36 : 300;
  shuffledCards.forEach((card, idx) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'tarot-card-deck';
    cardEl.dataset.idx = idx;
    
    // Calculate arc position (semi-circle)
    const progress = idx / (N - 1);
    const angle = -75 + progress * 150; // -75deg to +75deg
    const angleRad = angle * Math.PI / 180;
    const x = R * Math.sin(angleRad);
    const y = baseY - R * Math.cos(angleRad);

    cardEl.style.left = `calc(50% + ${x}px)`;
    cardEl.style.top = `${y}px`;
    cardEl.style.setProperty('--rot', `${angle}deg`);
    cardEl.style.setProperty('--z-index', idx);

    cardEl.addEventListener('click', () => {
      if (AppState.tarotSelection.length < 3) {
        selectTarotCard(card, cardEl);
      }
    });
    deckContainer.appendChild(cardEl);
  });
}

function selectTarotCard(cardInfo, cardEl) {
  MysticAudio.playFlip();
  cardEl.classList.add('selected'); // Lift card up to show it is selected
  
  AppState.tarotSelection.push({ cardInfo, flipped: false });
  const currentSlot = AppState.tarotSelection.length;
  
  // Render card back in slot
  const slot = document.getElementById(`slot-${currentSlot}`);
  
  const flipCard = document.createElement('div');
  flipCard.className = 'flip-card';
  flipCard.innerHTML = `
    <div class="flip-card-inner">
      <div class="card-front"></div>
      <div class="card-back">
        ${cardInfo.svg}
      </div>
    </div>
  `;
  
  flipCard.addEventListener('click', () => {
    if (!flipCard.classList.contains('flipped') && !flipCard.classList.contains('animating')) {
      flipCard.classList.add('animating');
      
      // Calculate delta to viewport center
      const cardRect = flipCard.getBoundingClientRect();
      const cardCenterX = cardRect.left + cardRect.width / 2;
      const cardCenterY = cardRect.top + cardRect.height / 2;
      
      const targetX = window.innerWidth / 2;
      const targetY = window.innerHeight / 2;
      
      const deltaX = targetX - cardCenterX;
      const deltaY = targetY - cardCenterY;
      
      // Animate smoothly to center and scale
      const isMobile = window.innerWidth <= 480;
      flipCard.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.22, 1)';
      flipCard.style.zIndex = '1000';
      flipCard.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${isMobile ? 1.4 : 1.8})`;
      
      // Flip the card after moving to center
      setTimeout(() => {
        flipCard.classList.add('flipped');
        MysticAudio.playFlip();
        
        // Move back to slot after 1.5s
        setTimeout(() => {
          flipCard.style.transform = '';
          
          // Complete animation and state updates after returning
          setTimeout(() => {
            flipCard.style.zIndex = '';
            flipCard.classList.remove('animating');
            
            const slotIndex = currentSlot - 1;
            AppState.tarotSelection[slotIndex].flipped = true;
            checkAllTarotFlipped();
          }, 600);
        }, 1500);
      }, 600);
    }
  });

  slot.appendChild(flipCard);

  if (AppState.tarotSelection.length === 3) {
    // Disable clicks on remaining deck cards
    const allCards = document.querySelectorAll('.tarot-card-deck');
    allCards.forEach(c => c.style.pointerEvents = 'none');

    // Wait 1 second to let user see their 3 cards standing tall
    setTimeout(() => {
      // Fade out all cards in the deck
      allCards.forEach(c => c.classList.add('hidden'));

      // Transition to slots view
      setTimeout(() => {
        document.getElementById('tarot-deck').classList.add('hidden');
        document.getElementById('tarot-spread-board').classList.add('hidden'); // Hide the entire board space to remove vertical gap
        document.getElementById('tarot-slots-container').classList.remove('hidden');
        document.getElementById('tarot-instructions').textContent = 'จิ้มเปิดไพ่ทีละใบเพื่อเปิดเผยชะตากรรม!';
      }, 300);
    }, 1000);
  }
}

function checkAllTarotFlipped() {
  const allFlipped = AppState.tarotSelection.every(card => card.flipped);
  if (allFlipped) {
    document.getElementById('tarot-result-actions').classList.remove('hidden');
    document.getElementById('tarot-instructions').textContent = 'ดวงชะตาเผยหมดสิ้นแล้ว! คลิกเปิดคำวิเคราะห์ดวงด้านล่าง';
    
    // Automatically trigger results show after 1.5s
    setTimeout(() => {
      showTarotResultModal();
    }, 1200);
  }
}

document.getElementById('btn-reset-tarot').addEventListener('click', resetTarotGame);

function showTarotResultModal() {
  const container = document.getElementById('tarot-modal-cards-container');
  container.innerHTML = '';
  
  const positions = ['1. อดีต (Past)', '2. ปัจจุบัน (Present)', '3. อนาคต (Future)'];
  
  AppState.tarotSelection.forEach((selected, idx) => {
    const card = selected.cardInfo;
    
    let text = card.gag;
    if (AppState.soloCategory === 'inspiration') text = card.inspiration;
    else if (AppState.soloCategory === 'serious') text = card.serious;

    const cardRow = document.createElement('div');
    cardRow.className = 'tarot-showcase-item';
    cardRow.innerHTML = `
      <div>${card.svg}</div>
      <div class="tarot-showcase-text">
        <span class="card-pos">${positions[idx]}</span>
        <h4>${card.thaiName} ${card.emoji}</h4>
        <p class="fortune-description">${text}</p>
      </div>
    `;
    container.appendChild(cardRow);
  });

  openModal('tarot');
}

// ==========================================================================
// MODAL CONTROLLERS
// ==========================================================================
const fortuneModal = document.getElementById('fortune-modal');
const modalEsiimsi = document.getElementById('modal-esiimsi-result');
const modalTarot = document.getElementById('modal-tarot-result');

function openModal(type) {
  fortuneModal.classList.remove('hidden');
  if (type === 'esiimsi') {
    modalEsiimsi.classList.remove('hidden');
    modalTarot.classList.add('hidden');
  } else if (type === 'tarot') {
    modalTarot.classList.remove('hidden');
    modalEsiimsi.classList.add('hidden');
  }
}

function closeModal() {
  fortuneModal.classList.add('hidden');
  modalEsiimsi.classList.add('hidden');
  modalTarot.classList.add('hidden');
}

document.getElementById('btn-close-modal').addEventListener('click', closeModal);
document.getElementById('btn-modal-done').addEventListener('click', closeModal);

// ==========================================================================
// MULTIPLAYER ONLINE (HOST & JOIN CLIENT)
// ==========================================================================
function getSocketUrl() {
  const urlVal = document.getElementById('input-backend-url').value.trim();
  if (urlVal !== '') {
    localStorage.setItem('mystic_backend_url', urlVal);
    return urlVal;
  }
  localStorage.removeItem('mystic_backend_url');
  return window.location.origin;
}

function setupJoinView() {
  // Reset fields
  document.getElementById('input-room-code').value = '';
  document.getElementById('input-player-name').value = '';
  const savedUrl = localStorage.getItem('mystic_backend_url') || '';
  document.getElementById('input-backend-url').value = savedUrl;
  document.getElementById('join-form-box').classList.remove('hidden');
  document.getElementById('player-controller-box').classList.add('hidden');
}

// ONLINE: Host Creates Room
const btnGotoOnline = document.getElementById('btn-goto-online');
if (btnGotoOnline) {
  btnGotoOnline.addEventListener('click', () => {
    // We can let them choose whether they want to host or join.
    // Let's create a trigger inside player join to either Join or Host!
    // We will add a small host button below the join form.
  });
}

// Since the UI design only has "ออนไลน์ปาร์ตี้เกม" which takes to player join form,
// we will add a button to "สร้างห้อง (สำหรับเปิดขึ้นจอใหญ่)" inside the join page.
// Let's add it dynamically to index.html join page if it's not there.
const joinFormBox = document.getElementById('join-form-box');
if (joinFormBox) {
  const createRoomLink = document.createElement('div');
  createRoomLink.className = 'text-center mt-6';
  createRoomLink.innerHTML = `<span style="color:#cbd5e1; font-size:0.85rem;">ต้องการจัดปาร์ตี้ดวงชะตาบนจอคอมใหญ่ใช่ไหม? </span><br>
  <button class="back-btn" style="color:var(--color-gold); font-weight:bold; margin-top:5px;" id="btn-host-create-room-action">🔮 คลิกสร้างห้องเล่นเกมที่นี่ (เป็นโฮสต์)</button>`;
  joinFormBox.appendChild(createRoomLink);

  document.getElementById('btn-host-create-room-action')?.addEventListener('click', () => {
    AppState.isHost = true;
    showSection('sec-online-host');
    initHostSocket();
  });
}

function initHostSocket() {
  const socketUrl = getSocketUrl(); // Socket.io dynamic URL
  AppState.socket = io(socketUrl);

  AppState.socket.on('connect', () => {
    console.log('Host connected to server');
    
    // Create Room
    AppState.socket.emit('create-room', (response) => {
      if (response.success) {
        AppState.roomCode = response.roomCode;
        document.getElementById('host-room-code').textContent = response.roomCode;
        
        // Render simple QR Code representing join link
        // We will make a beautiful link box to join
        const joinLink = `${window.location.origin}/?room=${response.roomCode}`;
        const qrBox = document.getElementById('qrcode-box');
        // Let's render a beautiful QR Code or instructions
        qrBox.innerHTML = `<div style="padding: 10px; color:#000; font-weight:bold; font-size:1.1rem; line-height:1.2;">
          <span style="font-size:0.8rem; color:#666;">จอยผ่านเว็บ:</span><br>
          ${response.roomCode}
        </div>`;
      }
    });
  });

  // Track players joining
  AppState.socket.on('player-update', (players) => {
    AppState.playersList = players;
    document.getElementById('player-count').textContent = players.length;
    
    const playersListEl = document.getElementById('host-players-list');
    playersListEl.innerHTML = '';
    
    if (players.length === 0) {
      playersListEl.innerHTML = '<li class="empty-list-msg">กำลังรอเพื่อนเข้าร่วมห้อง...</li>';
      document.getElementById('btn-host-start-game').disabled = true;
    } else {
      players.forEach(p => {
        const li = document.createElement('li');
        li.textContent = p.name;
        playersListEl.appendChild(li);
      });
      // Allow start if >= 1 player (ideal for testing, can be 5-6)
      document.getElementById('btn-host-start-game').disabled = false;
    }
  });

  // Host receives client actions (like spinning or voting)
  AppState.socket.on('room-action', ({ senderId, action, data }) => {
    const player = AppState.playersList.find(p => p.id === senderId);
    const playerName = player ? player.name : 'เพื่อน';

    if (action === 'spin-request' && AppState.activeGame === 'wheel') {
      triggerHostWheelSpin();
    }
    
    if (action === 'submit-compat' && AppState.activeGame === 'compatibility') {
      showHostCompatibilityResult(playerName, data);
    }
    
    if (action === 'submit-vote' && AppState.activeGame === 'likely') {
      handleIncomingVote(data.targetName);
    }
  });

  AppState.socket.on('room-closed', () => {
    alert('ห้องสนทนาถูกปิดตัวลง');
    showSection('sec-lobby');
  });
}

// Host Starts Game Party Loop
document.getElementById('btn-host-start-game').addEventListener('click', () => {
  document.getElementById('host-subview-lobby').classList.add('hidden');
  document.getElementById('host-subview-game-menu').classList.remove('hidden');
  document.getElementById('btn-host-start-game').classList.add('hidden'); // Hide start button once in menu

  // Notify clients that they are now in the game menu
  AppState.socket.emit('host-update', {
    roomCode: AppState.roomCode,
    event: 'state-menu',
    data: { menuState: 'active' }
  });
});

// Select specific Game
document.querySelectorAll('[data-game]').forEach(card => {
  card.addEventListener('click', (e) => {
    const game = e.currentTarget.dataset.game;
    launchHostGame(game);
  });
});

function launchHostGame(game) {
  AppState.activeGame = game;
  
  // Hide menu
  document.getElementById('host-subview-game-menu').classList.add('hidden');
  
  // Show target game screen
  document.getElementById(`host-subview-${game}`).classList.remove('hidden');
  
  if (game === 'wheel') {
    // Setup Host Wheel of Fortune Canvas
    const playerNames = AppState.playersList.map(p => p.name);
    AppState.hostWheel = new GameWheel('wheel-canvas');
    AppState.hostWheel.setOptions(playerNames);
    
    // Hide spin result box
    document.getElementById('wheel-result-box').classList.add('hidden');
    
    // Tell players to open their wheel controller
    AppState.socket.emit('host-update', {
      roomCode: AppState.roomCode,
      event: 'state-wheel',
      data: {}
    });
  }
  
  if (game === 'compatibility') {
    document.getElementById('compat-result-box').classList.add('hidden');
    document.getElementById('compat-waiting-text').classList.remove('hidden');
    document.getElementById('compat-waiting-text').textContent = 'กำลังรอให้มีผู้เล่นกรอกชื่อและกดสแกนดวงคู่กัน...';
    
    // BroadCast to players to open compatibility input controller
    // Send players list to select partners from
    AppState.socket.emit('host-update', {
      roomCode: AppState.roomCode,
      event: 'state-compatibility',
      data: { players: AppState.playersList }
    });
  }

  if (game === 'likely') {
    // Reset votes
    AppState.onlineVotes = {};
    AppState.playersList.forEach(p => {
      AppState.onlineVotes[p.name] = 0;
    });
    
    document.getElementById('vote-count-txt').textContent = '0';
    document.getElementById('btn-host-reveal-votes').disabled = true;

    // Draw random question
    const randomQ = PARTY_QUESTIONS[Math.floor(Math.random() * PARTY_QUESTIONS.length)];
    document.getElementById('likely-question-text').textContent = randomQ.question;
    document.getElementById('likely-question-text').dataset.comment = randomQ.funnyComment;
    
    // Clear chart
    document.getElementById('likely-votes-chart').innerHTML = '<div class="waiting-player-input">กำลังรอให้ผู้เล่นกดโหวตจากมือถือ...</div>';

    // Broadcast to players to open voting controller
    AppState.socket.emit('host-update', {
      roomCode: AppState.roomCode,
      event: 'state-likely',
      data: { 
        question: randomQ.question, 
        players: AppState.playersList 
      }
    });
  }

  if (game === 'king') {
    document.getElementById('king-command-container').classList.add('hidden');
    document.getElementById('king-card-anim').classList.remove('flipped');
    
    // Tell players to wait for king reveal
    AppState.socket.emit('host-update', {
      roomCode: AppState.roomCode,
      event: 'state-king',
      data: { status: 'waiting' }
    });
  }
}

// Back to game selection
const backToMenuButtons = [
  'btn-back-host-menu',
  'btn-back-host-menu2',
  'btn-back-host-menu3',
  'btn-back-host-menu4'
];

backToMenuButtons.forEach(btnId => {
  const btn = document.getElementById(btnId);
  if (btn) {
    btn.addEventListener('click', () => {
      // Hide all game screens
      const gameScreens = ['wheel', 'compatibility', 'likely', 'king'];
      gameScreens.forEach(g => {
        document.getElementById(`host-subview-${g}`).classList.add('hidden');
      });
      
      // Show menu
      document.getElementById('host-subview-game-menu').classList.remove('hidden');
      AppState.activeGame = '';

      // Sync players to wait
      AppState.socket.emit('host-update', {
        roomCode: AppState.roomCode,
        event: 'state-menu',
        data: {}
      });
    });
  }
});

// ONLINE: Spin wheel from Host
const hostSpinBtn = document.getElementById('btn-host-spin-wheel');
hostSpinBtn.addEventListener('click', triggerHostWheelSpin);

function triggerHostWheelSpin() {
  if (AppState.hostWheel && !AppState.hostWheel.isSpinning) {
    hostSpinBtn.disabled = true;
    document.getElementById('wheel-result-box').classList.add('hidden');
    
    // Send spin sound triggers / states to all clients
    AppState.socket.emit('host-update', {
      roomCode: AppState.roomCode,
      event: 'wheel-spinning',
      data: {}
    });

    AppState.hostWheel.spin((winnerName, idx) => {
      hostSpinBtn.disabled = false;
      
      // Create random funny fortune
      const randomFortunes = [
        'ดวงความรักจะพุ่งแรงแซงเพื่อนร่วมวงจนเพื่อนอิจฉาตาร้อน!',
        'ระวังเงินจะหมดไปกับการตามสปอยอาหารให้คนอื่นในกลุ่ม!',
        'ดวงมีลาภลอยใหญ่ แต่เพื่อนๆ กำลังเตรียมต่อคิวขอยืมตัวประคองดวงด่วน!',
        'จะได้แฟนสไตล์ขำๆ กวนๆ แต่คอยเทคแคร์เป็นอย่างดี!',
        'มีเกณฑ์ได้รับงานใหญ่แบบไม่รู้ตัว แต่ผลประโยชน์ล้นหลาม!'
      ];
      const winFortune = randomFortunes[idx % randomFortunes.length];

      document.getElementById('wheel-winner-display').textContent = winnerName;
      document.getElementById('wheel-winner-fortune').textContent = winFortune;
      document.getElementById('wheel-result-box').classList.remove('hidden');

      // Send winner display data to controllers
      AppState.socket.emit('host-update', {
        roomCode: AppState.roomCode,
        event: 'wheel-result',
        data: { winner: winnerName, fortune: winFortune }
      });
    });
  }
}

// ONLINE: Compatibility calculations from player controllers
function showHostCompatibilityResult(playerName, data) {
  document.getElementById('compat-waiting-text').classList.add('hidden');
  const resultBox = document.getElementById('compat-result-box');
  resultBox.classList.remove('hidden');

  const name1 = playerName;
  const name2 = data.partnerName;
  
  const scoreData = calculateCompatibility(name1, name2, data.bday1, data.bday2);
  
  document.getElementById('compat-names').textContent = `${name1} 💖 ${name2}`;
  document.getElementById('compat-score').textContent = `${scoreData.score}%`;
  document.getElementById('compat-title').textContent = scoreData.title;
  document.getElementById('compat-desc').textContent = scoreData.description;

  // Sound chimes
  MysticAudio.playSuccess();

  // Sync details to controller
  AppState.socket.emit('host-update', {
    roomCode: AppState.roomCode,
    event: 'compatibility-result',
    data: {
      names: `${name1} & ${name2}`,
      score: scoreData.score,
      title: scoreData.title,
      desc: scoreData.description
    }
  });
}

// ONLINE: Handle Votes for likely to game
function handleIncomingVote(targetName) {
  if (AppState.onlineVotes[targetName] !== undefined) {
    AppState.onlineVotes[targetName]++;
    
    // Total count
    const totalVotes = Object.values(AppState.onlineVotes).reduce((a, b) => a + b, 0);
    document.getElementById('vote-count-txt').textContent = totalVotes;
    
    // Enable reveal button once we have votes
    if (totalVotes > 0) {
      document.getElementById('btn-host-reveal-votes').disabled = false;
    }
    
    // Render live placeholder
    const chartContainer = document.getElementById('likely-votes-chart');
    chartContainer.innerHTML = '';
    
    Object.entries(AppState.onlineVotes).forEach(([name, count]) => {
      const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
      
      const row = document.createElement('div');
      row.className = 'chart-row';
      row.innerHTML = `
        <div class="chart-label">${name}</div>
        <div class="chart-bar-outer">
          <div class="chart-bar-inner" style="width: ${percentage}%"></div>
        </div>
        <div class="chart-value">${count} โหวต</div>
      `;
      chartContainer.appendChild(row);
    });
  }
}

// Host reveals final votes details
const hostRevealVotesBtn = document.getElementById('btn-host-reveal-votes');
hostRevealVotesBtn.addEventListener('click', () => {
  hostRevealVotesBtn.disabled = true;
  MysticAudio.playSuccess();
  
  // Find player with maximum votes
  let maxVotes = -1;
  let winnerName = 'ไม่มีเสียงโหวต';
  
  Object.entries(AppState.onlineVotes).forEach(([name, count]) => {
    if (count > maxVotes) {
      maxVotes = count;
      winnerName = name;
    }
  });

  const questionCard = document.getElementById('likely-question-text');
  const comment = questionCard.dataset.comment;

  // Transform title card to reveal winner
  questionCard.innerHTML = `<span style="font-size:0.9rem; color:var(--color-gold);">ผลลัพธ์มติหมู่ดาว:</span><br>
  <span style="font-size:1.8rem; color:var(--color-cyan);">${winnerName}</span><br>
  <p style="font-size:0.95rem; font-weight:normal; margin-top:10px; color:#fff;">${comment}</p>`;

  // Sync to players
  AppState.socket.emit('host-update', {
    roomCode: AppState.roomCode,
    event: 'likely-result',
    data: { winner: winnerName, comment }
  });
});

// Next Likely Question
document.getElementById('btn-next-likely-question').addEventListener('click', () => {
  launchHostGame('likely');
});

// ONLINE: King Game Draw Command
document.getElementById('btn-host-draw-king').addEventListener('click', () => {
  if (AppState.playersList.length === 0) return;
  
  // Flip animation card back and forth
  const cardAnim = document.getElementById('king-card-anim');
  cardAnim.classList.remove('flipped');
  document.getElementById('king-command-container').classList.add('hidden');
  
  setTimeout(() => {
    // Choose random king and command
    const randomKing = AppState.playersList[Math.floor(Math.random() * AppState.playersList.length)];
    const commandObj = KING_COMMANDS[Math.floor(Math.random() * KING_COMMANDS.length)];
    
    document.getElementById('king-name-reveal').textContent = randomKing.name;
    document.getElementById('king-command-reveal').textContent = commandObj.command;
    
    cardAnim.classList.add('flipped');
    MysticAudio.playSuccess();
    
    setTimeout(() => {
      document.getElementById('king-command-container').classList.remove('hidden');
    }, 400);

    // BroadCast to players who is King and who is servant
    AppState.socket.emit('host-update', {
      roomCode: AppState.roomCode,
      event: 'king-reveal',
      data: { 
        kingId: randomKing.id, 
        kingName: randomKing.name, 
        command: commandObj.command 
      }
    });
  }, 300);
});


// ==========================================================================
// PLAYER CONTROLLER CLIENT SUBMIT OR ACTIONS (Online Mode Join)
// ==========================================================================
document.getElementById('btn-player-submit-join').addEventListener('click', () => {
  const codeInput = document.getElementById('input-room-code').value.trim().toUpperCase();
  const nameInput = document.getElementById('input-player-name').value.trim();

  if (!codeInput || !nameInput) {
    alert('กรุณากรอกรหัสห้องและชื่อเล่นของคุณให้ถูกต้องครับ');
    return;
  }

  // Setup Socket Client Connection
  const socketUrl = getSocketUrl();
  AppState.socket = io(socketUrl);

  AppState.socket.on('connect', () => {
    AppState.socket.emit('join-room', { roomCode: codeInput, playerName: nameInput }, (response) => {
      if (response.success) {
        AppState.isHost = false;
        AppState.roomCode = response.roomCode;
        AppState.playerName = nameInput;
        
        document.getElementById('ctl-player-name').textContent = nameInput;
        document.getElementById('ctl-room-code').textContent = response.roomCode;
        
        // Toggle view
        document.getElementById('join-form-box').classList.add('hidden');
        document.getElementById('player-controller-box').classList.remove('hidden');
        
        showControllerScreen('lobby');
      } else {
        alert(response.message);
        AppState.socket.disconnect();
        AppState.socket = null;
      }
    });
  });

  // Client receives real-time game updates from host
  AppState.socket.on('game-update', ({ event, data }) => {
    if (event === 'state-menu') {
      showControllerScreen('menu-wait');
    }
    
    if (event === 'state-wheel') {
      showControllerScreen('wheel');
    }

    if (event === 'wheel-spinning') {
      // Shaking animations
      const shakeBtn = document.getElementById('btn-player-shake-wheel');
      shakeBtn.disabled = true;
      shakeBtn.textContent = '🎰 วงล้อกำลังหมุน...';
      MysticAudio.playShake();
    }

    if (event === 'wheel-result') {
      const shakeBtn = document.getElementById('btn-player-shake-wheel');
      shakeBtn.disabled = false;
      shakeBtn.textContent = '💫 สปินวงล้อสำเร็จ!';
      
      alert(`ผู้โชคดี: ${data.winner}\n${data.fortune}`);
    }

    if (event === 'state-compatibility') {
      showControllerScreen('compatibility');
      
      // Populate partner select field, excluding current player
      const partnerSelect = document.getElementById('select-partner');
      partnerSelect.innerHTML = '<option value="">-- เลือกเพื่อน --</option>';
      
      data.players.forEach(p => {
        if (p.name !== AppState.playerName) {
          const opt = document.createElement('option');
          opt.value = p.name;
          opt.textContent = p.name;
          partnerSelect.appendChild(opt);
        }
      });
    }

    if (event === 'compatibility-result') {
      alert(`ดวงสมพงษ์ ${data.names}: ระดับความเข้ากันได้ ${data.score}%\nหมวด: ${data.title}`);
    }

    if (event === 'state-likely') {
      showControllerScreen('likely');
      
      // Renders buttons for voting
      const listContainer = document.getElementById('likely-players-vote-buttons');
      listContainer.innerHTML = '';
      
      data.players.forEach(p => {
        const btn = document.createElement('button');
        btn.className = 'vote-choice-btn';
        btn.textContent = p.name;
        
        btn.addEventListener('click', () => {
          // Send vote to host
          AppState.socket.emit('client-action', {
            roomCode: AppState.roomCode,
            action: 'submit-vote',
            data: { targetName: p.name }
          });
          
          // Disable all buttons in voting area
          document.querySelectorAll('.vote-choice-btn').forEach(b => b.disabled = true);
          btn.classList.add('voted');
        });
        
        listContainer.appendChild(btn);
      });
    }

    if (event === 'likely-result') {
      alert(`ผลโหวตสูงสุดคือ: ${data.winner}\nคำวิจารณ์ชะตาชีวิต: ${data.comment}`);
    }

    if (event === 'state-king') {
      showControllerScreen('king');
      document.getElementById('ctl-king-role-title').textContent = '👑 กำลังรันโองการราชา...';
      document.getElementById('ctl-king-role-desc').textContent = 'จ้องมองที่จอหลักว่าโองการสวรรค์จะให้ใครเป็นพระราชา';
    }

    if (event === 'king-reveal') {
      const isKing = data.kingId === AppState.socket.id;
      const roleTitle = document.getElementById('ctl-king-role-title');
      const roleDesc = document.getElementById('ctl-king-role-desc');
      
      if (isKing) {
        roleTitle.textContent = '👑 คุณคือราชาแห่งโชคชะตา!';
        roleDesc.innerHTML = `<span style="color:var(--color-gold); font-size:1.1rem; font-weight:bold;">โองการบัญชาเพื่อนของคุณ:</span><br>
        ${data.command}`;
        MysticAudio.playSuccess();
      } else {
        roleTitle.textContent = '🧙 คุณคือผู้ใต้บัญชาการ';
        roleDesc.innerHTML = `พระราชาดวงชะตารอบนี้คือ <b>${data.kingName}</b><br>
        สิทธิ์พระราชาสั่งเพื่อน: "${data.command}"`;
      }
    }
  });

  AppState.socket.on('room-closed', ({ message }) => {
    alert(message || 'ห้องนี้ถูกปิดแล้ว');
    showSection('sec-lobby');
  });
});

// Switch screens in player controller layout
function showControllerScreen(screenName) {
  const screens = ['lobby', 'menu-wait', 'wheel', 'compatibility', 'likely', 'king'];
  screens.forEach(s => {
    const el = document.getElementById(`ctl-screen-${s}`);
    if (el) el.classList.add('hidden');
  });

  const activeEl = document.getElementById(`ctl-screen-${screenName}`);
  if (activeEl) {
    activeEl.classList.remove('hidden');
    setTimeout(() => {
      activeEl.classList.add('active');
    }, 50);
  }
}

// Controller Actions: spin wheel trigger
document.getElementById('btn-player-shake-wheel').addEventListener('click', () => {
  AppState.socket.emit('client-action', {
    roomCode: AppState.roomCode,
    action: 'spin-request',
    data: {}
  });
});

// Controller Actions: submit compatibility details
document.getElementById('btn-player-submit-compat').addEventListener('click', () => {
  const partnerName = document.getElementById('select-partner').value;
  const bday1 = document.getElementById('ctl-compat-birthday').value;
  const bday2 = document.getElementById('ctl-partner-birthday').value;

  if (!partnerName || !bday1) {
    alert('กรุณาเลือกเพื่อนร่วมดวงและกรอกวันเกิดของคุณก่อนครับ');
    return;
  }

  AppState.socket.emit('client-action', {
    roomCode: AppState.roomCode,
    action: 'submit-compat',
    data: { partnerName, bday1, bday2 }
  });
  
  // Clear select
  document.getElementById('btn-player-submit-compat').disabled = true;
  document.getElementById('btn-player-submit-compat').textContent = 'ส่งประเมินผลแล้ว 💖';
});


// ==========================================================================
// OFFLINE LOCAL PARTY BOARD (PASS & PLAY MECHANICS)
// ==========================================================================
function setupOfflineSetupView() {
  const inputsContainer = document.getElementById('offline-name-inputs');
  // Reset inputs with 2 default fields
  inputsContainer.innerHTML = `
    <div class="form-row-player">
      <input type="text" class="mystic-input offline-name-field" placeholder="ชื่อเล่นเพื่อนคนที่ 1" maxlength="10">
    </div>
    <div class="form-row-player">
      <input type="text" class="mystic-input offline-name-field" placeholder="ชื่อเล่นเพื่อนคนที่ 2" maxlength="10">
    </div>
  `;
  
  document.getElementById('offline-entry-panel').classList.remove('hidden');
  document.getElementById('offline-board-panel').classList.add('hidden');
}

// Add another local player inputs
document.getElementById('btn-offline-add-player').addEventListener('click', () => {
  const inputsContainer = document.getElementById('offline-name-inputs');
  const count = inputsContainer.querySelectorAll('.offline-name-field').length;
  
  if (count >= 8) {
    alert('ใส่ชื่อผู้เล่นได้สูงสุด 8 คนต่อหนึ่งห้องออฟไลน์ครับ');
    return;
  }

  const row = document.createElement('div');
  row.className = 'form-row-player';
  row.innerHTML = `<input type="text" class="mystic-input offline-name-field" placeholder="ชื่อเล่นเพื่อนคนที่ ${count + 1}" maxlength="10">`;
  inputsContainer.appendChild(row);
});

// Launch offline board
document.getElementById('btn-offline-start-board').addEventListener('click', () => {
  const fields = document.querySelectorAll('.offline-name-field');
  const names = [];
  
  fields.forEach(field => {
    const val = field.value.trim();
    if (val) names.push(val);
  });

  if (names.length < 2) {
    alert('กรุณากรอกชื่ออย่างน้อย 2 คนเพื่อเริ่มเล่นเกมปาร์ตี้ครับ');
    return;
  }

  AppState.offlinePlayers = names;

  // Toggle setup panel
  document.getElementById('offline-entry-panel').classList.add('hidden');
  document.getElementById('offline-board-panel').classList.remove('hidden');

  // Display sidebar player list
  const sidebarList = document.getElementById('offline-players-list-display');
  sidebarList.innerHTML = '';
  names.forEach(name => {
    const li = document.createElement('li');
    li.textContent = name;
    sidebarList.appendChild(li);
  });

  // Switch Subview to menu Selection
  showOfflineSubView('game-menu');
});

// Quit offline play
document.getElementById('btn-quit-offline').addEventListener('click', () => {
  setupOfflineSetupView();
});

// Offline Subview Swapper
function showOfflineSubView(viewName) {
  const subViews = ['game-menu', 'wheel', 'compatibility', 'likely', 'king', 'xo', 'racing'];
  subViews.forEach(v => {
    const el = document.getElementById(`off-subview-${v}`);
    if (el) el.classList.add('hidden');
  });

  const target = document.getElementById(`off-subview-${viewName}`);
  if (target) target.classList.remove('hidden');
}

// Select Local Game from menu cards
document.querySelectorAll('[data-offgame]').forEach(card => {
  card.addEventListener('click', (e) => {
    const game = e.currentTarget.dataset.offgame;
    launchOfflineGame(game);
  });
});

function launchOfflineGame(game) {
  showOfflineSubView(game);

  if (game === 'wheel') {
    document.getElementById('off-wheel-result-box').classList.add('hidden');
    
    // Render wheel options
    AppState.offlineWheel = new GameWheel('offline-wheel-canvas');
    AppState.offlineWheel.setOptions(AppState.offlinePlayers);
  }

  if (game === 'compatibility') {
    document.getElementById('off-compat-result-box').classList.add('hidden');
    
    // Populate select fields with local names
    const s1 = document.getElementById('off-compat-select1');
    const s2 = document.getElementById('off-compat-select2');
    s1.innerHTML = '';
    s2.innerHTML = '';

    AppState.offlinePlayers.forEach(name => {
      const o1 = document.createElement('option');
      o1.value = name;
      o1.textContent = name;
      const o2 = o1.cloneNode(true);
      
      s1.appendChild(o1);
      s2.appendChild(o2);
    });

    // Make second selector choose index 1
    if (s2.options.length > 1) {
      s2.selectedIndex = 1;
    }
  }

  if (game === 'likely') {
    drawOfflineLikelyQuestion();
  }

  if (game === 'king') {
    document.getElementById('off-king-command-container').classList.add('hidden');
    document.getElementById('off-king-card-anim').classList.remove('flipped');
  }

  if (game === 'xo') {
    // Populate select fields with local player names
    const selectX = document.getElementById('xo-select-player-x');
    const selectO = document.getElementById('xo-select-player-o');
    if (selectX && selectO) {
      selectX.innerHTML = '';
      selectO.innerHTML = '';
      
      const players = AppState.offlinePlayers && AppState.offlinePlayers.length > 0
        ? AppState.offlinePlayers
        : ['ผู้เล่น 1', 'ผู้เล่น 2'];
        
      players.forEach(name => {
        const optX = document.createElement('option');
        optX.value = name;
        optX.textContent = name;
        const optO = optX.cloneNode(true);
        
        selectX.appendChild(optX);
        selectO.appendChild(optO);
      });
      
      // Auto select the second player for O if available
      if (selectO.options.length > 1) {
        selectO.selectedIndex = 1;
      }
    }
    resetXOGame();
  }

  if (game === 'racing') {
    resetRacingGame();
  }
}

// Back to local menu buttons
const backToOffMenuButtons = [
  'btn-back-off-menu',
  'btn-back-off-menu2',
  'btn-back-off-menu3',
  'btn-back-off-menu4',
  'btn-back-off-menu5',
  'btn-back-off-menu6'
];

backToOffMenuButtons.forEach(btnId => {
  const el = document.getElementById(btnId);
  if (el) {
    el.addEventListener('click', () => {
      showOfflineSubView('game-menu');
    });
  }
});

// OFFLINE: Spin local wheel
const localSpinBtn = document.getElementById('btn-offline-spin-wheel');
localSpinBtn.addEventListener('click', () => {
  if (AppState.offlineWheel && !AppState.offlineWheel.isSpinning) {
    localSpinBtn.disabled = true;
    document.getElementById('off-wheel-result-box').classList.add('hidden');
    
    AppState.offlineWheel.spin((winnerName, idx) => {
      localSpinBtn.disabled = false;
      
      const randomLocalFortunes = [
        'เพื่อนคนนี้กำลังจะมีโชคจากการโดนทักรักแปลกๆ ในเดือนนี้!',
        'ดวงดีมากวันนี้เป็นมงคล แต่มีเกณฑ์ได้แชร์ตังค์จ่ายหมูกระทะให้เพื่อนในกลุ่ม!',
        'ดวงความรักโดดเด่นสะดุดตาสุดๆ คนโสดจะเจอคนหน้าตาดีเดินเบียดบนรถไฟฟ้า!',
        'ระวังอย่าคุยเรื่องดวงกับเพื่อนคนข้างๆ วันนี้อาจเกิดข้อพิพาทแย่งของกินกัน!',
        'การงานการเรียนดีเด่น แต่สุขภาพข้อเข่าเสื่อมกำลังจะมาเยือนในวัยก่อนวัยทอง!'
      ];
      const winFortune = randomLocalFortunes[idx % randomLocalFortunes.length];

      document.getElementById('off-wheel-winner-display').textContent = winnerName;
      document.getElementById('off-wheel-winner-fortune').textContent = winFortune;
      document.getElementById('off-wheel-result-box').classList.remove('hidden');
    });
  }
});

// OFFLINE: Run compatibility calculations local
document.getElementById('btn-offline-run-compat').addEventListener('click', () => {
  const n1 = document.getElementById('off-compat-select1').value;
  const n2 = document.getElementById('off-compat-select2').value;

  if (n1 === n2) {
    alert('กรุณาเลือกเพื่อนสองคนที่ต่างกันเพื่อเปรียบเทียบระดับความสมพงษ์ครับ');
    return;
  }

  const scoreData = calculateCompatibility(n1, n2, '1995-01-01', '1996-01-01'); // Static mock bdays for simplicity

  document.getElementById('off-compat-names').textContent = `${n1} & ${n2}`;
  document.getElementById('off-compat-score').textContent = `${scoreData.score}%`;
  document.getElementById('off-compat-title').textContent = scoreData.title;
  document.getElementById('off-compat-desc').textContent = scoreData.description;

  document.getElementById('off-compat-result-box').classList.remove('hidden');
  
  MysticAudio.playSuccess();
});

// OFFLINE: Likely to questions loop
function drawOfflineLikelyQuestion() {
  const randomQ = PARTY_QUESTIONS[Math.floor(Math.random() * PARTY_QUESTIONS.length)];
  document.getElementById('off-likely-question-text').textContent = randomQ.question;
}

document.getElementById('btn-offline-next-likely').addEventListener('click', () => {
  drawOfflineLikelyQuestion();
  MysticAudio.playClick();
});

// OFFLINE: King Draw local
document.getElementById('btn-offline-draw-king').addEventListener('click', () => {
  const cardAnim = document.getElementById('off-king-card-anim');
  cardAnim.classList.remove('flipped');
  document.getElementById('off-king-command-container').classList.add('hidden');

  setTimeout(() => {
    // Choose random local king and command
    const randomKing = AppState.offlinePlayers[Math.floor(Math.random() * AppState.offlinePlayers.length)];
    const commandObj = KING_COMMANDS[Math.floor(Math.random() * KING_COMMANDS.length)];
    
    document.getElementById('off-king-name-reveal').textContent = randomKing;
    document.getElementById('off-king-command-reveal').textContent = commandObj.command;
    
    cardAnim.classList.add('flipped');
    MysticAudio.playSuccess();
    
    setTimeout(() => {
      document.getElementById('off-king-command-container').classList.remove('hidden');
    }, 400);
  }, 300);
});

// ==========================================================================
// OFFLINE XO GAME LOGIC
// ==========================================================================
let xoBoard = Array(9).fill('');
let xoCurrentPlayer = 'X';
let xoGameActive = true;

function updateXOTurnDisplay() {
  const selectX = document.getElementById('xo-select-player-x');
  const selectO = document.getElementById('xo-select-player-o');
  const nameX = selectX && selectX.value ? selectX.value : 'ผู้เล่น X';
  const nameO = selectO && selectO.value ? selectO.value : 'ผู้เล่น O';
  const statusEl = document.getElementById('xo-status');
  if (statusEl) {
    if (xoGameActive) {
      const activeName = xoCurrentPlayer === 'X' ? nameX : nameO;
      statusEl.innerHTML = `ตาของท่าน: <span style="color: ${xoCurrentPlayer === 'X' ? 'var(--color-magenta)' : 'var(--color-cyan)'}; font-weight: bold; font-size: 1.35rem;">${activeName}</span> (${xoCurrentPlayer})`;
    }
  }
}

function resetXOGame() {
  xoBoard = Array(9).fill('');
  xoCurrentPlayer = 'X';
  xoGameActive = true;
  updateXOTurnDisplay();
  document.querySelectorAll('.xo-cell').forEach(cell => {
    cell.textContent = '';
    cell.className = 'xo-cell';
  });
}

function handleXOCellClick(e) {
  const cell = e.target;
  const index = parseInt(cell.dataset.cellIndex);

  if (xoBoard[index] !== '' || !xoGameActive) return;

  xoBoard[index] = xoCurrentPlayer;
  cell.textContent = xoCurrentPlayer;
  cell.classList.add(xoCurrentPlayer.toLowerCase());
  MysticAudio.playClick();

  const selectX = document.getElementById('xo-select-player-x');
  const selectO = document.getElementById('xo-select-player-o');
  const nameX = selectX && selectX.value ? selectX.value : 'ผู้เล่น X';
  const nameO = selectO && selectO.value ? selectO.value : 'ผู้เล่น O';

  if (checkXOWin()) {
    const statusEl = document.getElementById('xo-status');
    const winnerName = xoCurrentPlayer === 'X' ? nameX : nameO;
    if (statusEl) {
      statusEl.innerHTML = `🎉 ผู้ชนะคือผู้เล่น: <span style="color: ${xoCurrentPlayer === 'X' ? 'var(--color-magenta)' : 'var(--color-cyan)'}; font-weight: bold; font-size: 1.45rem;">${winnerName}</span> (${xoCurrentPlayer})!`;
    }
    xoGameActive = false;
    MysticAudio.playSuccess();
    return;
  }

  if (!xoBoard.includes('')) {
    const statusEl = document.getElementById('xo-status');
    if (statusEl) statusEl.textContent = 'เสมอ! เล่นใหม่อีกรอบนะจ๊ะ 🤝';
    xoGameActive = false;
    MysticAudio.playClick();
    return;
  }

  xoCurrentPlayer = xoCurrentPlayer === 'X' ? 'O' : 'X';
  updateXOTurnDisplay();
}

function checkXOWin() {
  const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  return winConditions.some(condition => {
    const [a, b, c] = condition;
    return xoBoard[a] && xoBoard[a] === xoBoard[b] && xoBoard[a] === xoBoard[c];
  });
}

// Bind XO cell clicks
document.querySelectorAll('.xo-cell').forEach(cell => {
  cell.addEventListener('click', handleXOCellClick);
});

// Bind XO reset button
const resetXOBtn = document.getElementById('btn-reset-xo');
if (resetXOBtn) {
  resetXOBtn.addEventListener('click', resetXOGame);
}

// Bind XO dropdown profile changes
const selectXEl = document.getElementById('xo-select-player-x');
const selectOEl = document.getElementById('xo-select-player-o');
if (selectXEl) selectXEl.addEventListener('change', updateXOTurnDisplay);
if (selectOEl) selectOEl.addEventListener('change', updateXOTurnDisplay);


// ==========================================================================
// OFFLINE CAR RACING GAME LOGIC
// ==========================================================================
let racingInterval = null;
let raceActive = false;

function resetRacingGame() {
  raceActive = false;
  clearInterval(racingInterval);
  const winBox = document.getElementById('race-winner-box');
  const startBtn = document.getElementById('btn-start-race');
  if (winBox) winBox.classList.add('hidden');
  if (startBtn) startBtn.disabled = false;
  
  for (let i = 1; i <= 4; i++) {
    const car = document.getElementById(`car-${i}`);
    if (car) car.style.left = '30px';
  }
}

function startRacingGame() {
  if (raceActive) return;
  raceActive = true;
  
  const startBtn = document.getElementById('btn-start-race');
  const winBox = document.getElementById('race-winner-box');
  if (startBtn) startBtn.disabled = true;
  if (winBox) winBox.classList.add('hidden');
  MysticAudio.playClick();

  const carPositions = { 1: 30, 2: 30, 3: 30, 4: 30 };
  const track = document.querySelector('.racing-track-container');
  const trackWidth = track ? track.clientWidth : 300;
  const finishThreshold = trackWidth - 85;

  racingInterval = setInterval(() => {
    for (let i = 1; i <= 4; i++) {
      let speed = Math.random() * 8 + 1;
      if (Math.random() < 0.05) {
        speed += 12; // speed boost!
      }
      
      carPositions[i] += speed;
      const car = document.getElementById(`car-${i}`);
      if (car) {
        car.style.left = `${carPositions[i]}px`;
      }

      if (carPositions[i] >= finishThreshold) {
        clearInterval(racingInterval);
        raceActive = false;
        
        const carColors = {
          1: 'รถคันที่ 1 (สีแดง) 🏎️🔴',
          2: 'รถคันที่ 2 (สีน้ำเงิน) 🏎️🔵',
          3: 'รถคันที่ 3 (สีเขียว) 🏎️🟢',
          4: 'รถคันที่ 4 (สีเหลือง) 🏎️🟡'
        };
        
        const displayEl = document.getElementById('race-winner-display');
        if (displayEl) displayEl.textContent = carColors[i];
        if (winBox) winBox.classList.remove('hidden');
        
        MysticAudio.playSuccess();
        break;
      }
    }
  }, 60);
}

// Bind Racing event listeners
const startRaceBtn = document.getElementById('btn-start-race');
if (startRaceBtn) {
  startRaceBtn.addEventListener('click', startRacingGame);
}

const resetRaceBtn = document.getElementById('btn-reset-race');
if (resetRaceBtn) {
  resetRaceBtn.addEventListener('click', resetRacingGame);
}


// ==========================================================================
// MYHORA-STYLE ASTROLOGY TOOL EVENT LISTENERS
// ==========================================================================
document.getElementById('btn-start-numeric').addEventListener('click', () => {
  showSection('sec-numeric');
  document.getElementById('numeric-result-box').classList.add('hidden');
  document.getElementById('input-astronum').value = '';
});

document.getElementById('btn-start-zodmatch').addEventListener('click', () => {
  showSection('sec-zodiac-match');
  document.getElementById('zodmatch-result-box').classList.add('hidden');
});

document.getElementById('btn-start-zodread').addEventListener('click', () => {
  showSection('sec-zodiac-reading');
  document.getElementById('zodread-result-box').classList.add('hidden');
});

document.getElementById('btn-start-consult')?.addEventListener('click', () => {
  showSection('sec-consult');
});

// 1. Numeric Analysis trigger
document.getElementById('btn-submit-numeric').addEventListener('click', () => {
  const numVal = document.getElementById('input-astronum').value.trim();
  const numType = document.getElementById('select-num-type').value;

  if (!numVal) {
    alert('กรุณากรอกตัวเลขที่ต้องการวิเคราะห์ก่อนครับ');
    return;
  }

  const result = analyzeNumbers(numVal, numType);
  if (result.error) {
    alert(result.error);
    return;
  }

  // Render values
  document.getElementById('num-result-sum').textContent = result.sum;
  document.getElementById('num-result-grade').textContent = result.grade;
  document.getElementById('num-result-summary').textContent = result.summary;

  // Good pairs list
  const goodList = document.getElementById('num-good-pairs-list');
  goodList.innerHTML = '';
  if (result.goodPairs.length === 0) {
    goodList.innerHTML = '<li>ไม่มีคู่เลขมงคลเด่นชัดในชุดนี้</li>';
  } else {
    result.goodPairs.forEach(p => {
      const li = document.createElement('li');
      li.innerHTML = `<b>${p.pair}:</b> ${p.meaning}`;
      goodList.appendChild(li);
    });
  }

  // Bad pairs list
  const badList = document.getElementById('num-bad-pairs-list');
  badList.innerHTML = '';
  if (result.badPairs.length === 0) {
    badList.innerHTML = '<li>ไม่มีคู่เลขเตือนภัย ปลอดภัยหายห่วง</li>';
  } else {
    result.badPairs.forEach(p => {
      const li = document.createElement('li');
      li.innerHTML = `<b>${p.pair}:</b> ${p.meaning}`;
      badList.appendChild(li);
    });
  }

  document.getElementById('numeric-result-box').classList.remove('hidden');
  MysticAudio.playSuccess();
});

// 2. Zodiac Matcher trigger
document.getElementById('btn-submit-zodmatch').addEventListener('click', () => {
  const z1 = document.getElementById('select-zodmatch-z1').value;
  const z2 = document.getElementById('select-zodmatch-z2').value;
  const d1 = document.getElementById('select-zodmatch-day1').value;
  const d2 = document.getElementById('select-zodmatch-day2').value;

  const result = calculateZodiacMatch(z1, z2, d1, d2);

  // Render values
  document.getElementById('zodmatch-names-title').textContent = `ราศี${z1} & ราศี${z2}`;
  document.getElementById('zodmatch-score-val').textContent = `${result.score}%`;
  document.getElementById('zodmatch-elem-text').innerHTML = `<b>ดวงความสัมพันธ์ธาตุ:</b> ${result.elemMatch}`;
  document.getElementById('zodmatch-day-text').innerHTML = `<b>ดวงวันเกิดสมพงษ์:</b> ${result.dayMatch}`;

  // Decide affinity level
  let affinityLevel = '💔 ดวงไม่สมพงษ์กันนัก';
  if (result.score >= 85) affinityLevel = '💖 สมพงษ์กันดีเลิศ (คู่แท้เกื้อกูล)';
  else if (result.score >= 70) affinityLevel = '🤝 คู่มิตรมิตรแท้ (ประคับประคองดี)';
  else if (result.score >= 50) affinityLevel = '🧘 คู่ทรงตัวพอดี (ต้องปรับความเข้าใจ)';
  else if (result.score >= 35) affinityLevel = '⚠️ คู่ลิขิตต้องระวัง (มีข้อขัดแย้งสะสม)';

  document.getElementById('zodmatch-affinity-level').textContent = affinityLevel;
  document.getElementById('zodmatch-result-box').classList.remove('hidden');
  MysticAudio.playSuccess();
});

// 3. Zodiac Reading trigger
document.getElementById('btn-submit-zodread').addEventListener('click', () => {
  const date = document.getElementById('select-zodread-date').value;
  const month = document.getElementById('select-zodread-month').value;

  const result = getZodiacAndElement(date, month);

  // Render values
  document.getElementById('zodread-sign-title').textContent = result.name;
  document.getElementById('zodread-element').textContent = result.element;
  document.getElementById('zodread-color').textContent = result.color;
  document.getElementById('zodread-number').textContent = result.number;
  document.getElementById('zodread-trait-desc').textContent = result.trait;
  document.getElementById('zodread-forecast-desc').textContent = result.forecast;

  const ranges = {
    "เมษ": "13 เม.ย. - 13 พ.ค.", "พฤษภ": "14 พ.ค. - 13 มิ.ย.", "เมถุน": "14 มิ.ย. - 14 ก.ค.",
    "กรกฎ": "15 ก.ค. - 15 ส.ค.", "สิงห์": "16 ส.ค. - 16 ก.ย.", "กันย์": "17 ก.ย. - 16 ต.ค.",
    "ตุลย์": "17 ต.ค. - 15 พ.ย.", "พิจิก": "16 พ.ย. - 15 ธ.ค.", "ธนู": "16 ธ.ค. - 14 ม.ค.",
    "มังกร": "15 ม.ค. - 12 ก.พ.", "กุมภ์": "13 ก.พ. - 13 มี.ค.", "มีน": "14 มี.ค. - 12 เม.ย."
  };
  document.getElementById('zodread-range-title').textContent = ranges[result.sign] || '';

  document.getElementById('zodread-result-box').classList.remove('hidden');
  MysticAudio.playSuccess();
});

// ==========================================================================
// DREAM DICTIONARY AND LOTTERY PREDICTIONS (ACCURATE MYSTIC DATA)
// ==========================================================================
const DREAM_DATABASE = {
  "งู": {
    meaning: "ฝันเห็นงูโบราณทำนายว่า: หากเป็นคนโสดจะได้พบเนื้อคู่ในเร็ววัน หรือจะมีเสน่ห์ดึงดูดเพศตรงข้ามอย่างมาก แต่หากฝันว่างูรัดหรือทำร้าย อาจเกิดจากการถูกเพศตรงข้ามเพ่งเล็งหรือปองร้าย หรือมีมิตรคิดคดทรยศนำเรื่องเดือดร้อนมาให้ ให้ระมัดระวังคำพูดและการทำสัญญา",
    num2: "56",
    num3: "569"
  },
  "ทอง": {
    meaning: "ฝันเห็นทองคำโบราณทำนายว่า: คุณกำลังจะได้รับโชคลาภก้อนใหญ่จากการทำงานหรือการเสี่ยงโชค หากเป็นสตรีมีครรภ์โบราณว่าจะได้บุตรสาวที่น่ารักและมีวาสนาสูง หากเป็นคนทำงานจะได้รับข่าวดีเรื่องการเลื่อนตำแหน่งหน้าที่การงานและการเงินคล่องตัวขึ้นอย่างมาก",
    num2: "19",
    num3: "919"
  },
  "ฟันหัก": {
    meaning: "ฝันว่าฟันหักทำนายว่า: หากฟันบนหักโบราณว่าจะต้องระมัดระวังสุขภาพของญาติผู้ใหญ่ฝั่งบิดา หากฟันล่างหักต้องระวังสุขภาพญาติผู้ใหญ่ฝั่งมารดา หรือตัวท่านเองอาจมีคดีความหรือเรื่องมีปากเสียงขัดแย้งในที่ทำงาน ให้หมั่นสวดมนต์อธิษฐานจิตแผ่เมตตาแก้เคล็ด",
    num2: "05",
    num3: "505"
  },
  "ศพ": {
    meaning: "ฝันเห็นคนเสียชีวิตหรือศพทำนายว่า: เรื่องร้ายๆ กำลังจะผ่านพ้นไป ความทุกข์โศกหรือโรคภัยไข้เจ็บของตัวท่านจะหมดสิ้น และกำลังจะมีลาภลอยหรือได้โชคลาภจากการเสี่ยงโชค เลขเด่นโดดเด่นมาก มีโอกาสได้โชคลาภจากทางไกลหรือสิ่งศักดิ์สิทธิ์ให้โชค",
    num2: "14",
    num3: "144"
  },
  "น้ำท่วม": {
    meaning: "ฝันเห็นน้ำท่วมใหญ่ทำนายว่า: จะต้องโยกย้ายหน้าที่การงานหรือถิ่นที่อยู่อาศัยในเร็วๆ นี้ หรือต้องออกเดินทางไกลกระทันหัน การทำงานมีอุปสรรคให้คอยแก้ไขบ่อยครั้ง แต่หลังจากอุปสรรคผ่านพ้นจะเกิดความรุ่งเรืองและการเปลี่ยนแปลงที่ดีขึ้น",
    num2: "22",
    num3: "255"
  },
  "ช้าง": {
    meaning: "ฝันเห็นช้างตัวใหญ่ทำนายว่า: เป็นฝันมงคลอย่างสูงยิ่ง คุณจะได้รับโชคลาภวาสนาบารมีจากผู้หลักผู้ใหญ่ในบ้านเมือง หรือได้รับข่าวดีเรื่องการงานที่ยิ่งใหญ่ การเดินทางไกลปลอดภัยและสำเร็จสมปรารถนาทุกประการ",
    num2: "95",
    num3: "955"
  },
  "เต่า": {
    meaning: "ฝันเห็นเต่าทำนายว่า: จะได้รับข่าวดีจากญาติผู้ใหญ่อายุยาวนาน หรือตัวท่านจะหมดเคราะห์หมดโรคภัย สุขภาพร่างกายแข็งแรงกระปรี้กระเปร่าขึ้น การเงินหมุนเวียนได้ดีขึ้นแบบช้าๆ แต่มั่นคง",
    num2: "43",
    num3: "433"
  },
  "แหวน": {
    meaning: "ฝันเห็นแหวนทองหรือเครื่องประดับทำนายว่า: คนโสดมีเกณฑ์จะได้พบรักที่อบอุ่นและสุขสมบูรณ์ คนมีคู่จะได้ข่าวดีเรื่องบุตรหรือทายาทที่รอคอย หรือได้รับโชคลาภมงคลจากคู่ครองของท่านเอง",
    num2: "08",
    num3: "808"
  }
};

function getDreamPrediction(keyword) {
  const cleanKeyword = keyword.trim().toLowerCase();
  
  // Try to find a matching keyword inside the database
  let foundKey = Object.keys(DREAM_DATABASE).find(k => cleanKeyword.includes(k) || k.includes(cleanKeyword));
  
  if (foundKey) {
    return DREAM_DATABASE[foundKey];
  }
  
  // Fallback for custom dreams (generates a pseudo-random but highly mystical prediction)
  const hash = cleanKeyword.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const fallbackMeanings = [
    `ฝันเห็น "${keyword}" ทำนายตามตำราโบราณว่า: ชะตาชีวิตกำลังจะพบกับการเปลี่ยนแปลงครั้งใหญ่ในด้านความก้าวหน้าและการโยกย้าย จะมีมิตรแท้คอยเกื้อหนุนช่วยเหลือ ให้หมั่นทำบุญตักบาตรกรวดน้ำเสริมโชคลาภบารมี`,
    `ฝันเห็น "${keyword}" ทำนายตามตำราโบราณว่า: คุณจะได้รับลาภผลเล็กๆ น้อยๆ จากการเดินทางหรือการเจรจาค้าขาย การเงินมีเกณฑ์ได้ลาภลอยแต่ต้องแบ่งทำบุญเพื่อสะสมผลบุญเสริมดวงชะตา`,
    `ฝันเห็น "${keyword}" ทำนายตามตำราโบราณว่า: ช่วงนี้ให้ระมัดระวังเรื่องคำพูดและการมีปากเสียงในวงงาน อาจเกิดความเข้าใจผิดขัดแย้งกับผู้อื่นได้ง่าย แต่เรื่องโชคลาภและการเสี่ยงโชคยังอยู่ในเกณฑ์กลางๆ พอมีโชค`,
    `ฝันเห็น "${keyword}" ทำนายตามตำราโบราณว่า: หมดเคราะห์หมดโศกในสิ่งที่มีปัญหาคาใจ สุขภาพร่างกายจะกลับมาสมบูรณ์แข็งแรงดีขึ้นอย่างมาก หากมีการลงทุนค้าขายจะได้รับผลกำไรเป็นที่พึงพอใจ`
  ];
  
  const num2Val = String((hash % 90) + 10); // 10-99
  const num3Val = String((hash % 900) + 100); // 100-999
  
  return {
    meaning: fallbackMeanings[hash % fallbackMeanings.length],
    num2: num2Val,
    num3: num3Val
  };
}

// Bind Dream Submit
const btnSubmitDream = document.getElementById('btn-submit-dream');
if (btnSubmitDream) {
  btnSubmitDream.addEventListener('click', () => {
    const keyword = document.getElementById('input-dream-keyword').value;
    if (!keyword || keyword.trim() === '') {
      alert('กรุณากรอกสิ่งที่คุณฝันถึงก่อนกดทำนายจ้า');
      return;
    }
    const result = getDreamPrediction(keyword);
    
    document.getElementById('dream-reveal-title').textContent = `🔮 คำทำนายฝันเกี่ยวกับ: "${keyword}"`;
    document.getElementById('dream-reveal-meaning').textContent = result.meaning;
    document.getElementById('dream-num-2').textContent = result.num2;
    document.getElementById('dream-num-3').textContent = result.num3;
    
    document.getElementById('dream-result-box').classList.remove('hidden');
    MysticAudio.playSuccess();
  });
}

// Bind suggestions click events
document.querySelectorAll('.suggestion-badge').forEach(badge => {
  badge.addEventListener('click', () => {
    const keyword = badge.getAttribute('data-dream');
    document.getElementById('input-dream-keyword').value = keyword;
    const result = getDreamPrediction(keyword);
    
    document.getElementById('dream-reveal-title').textContent = `🔮 คำทำนายฝันเกี่ยวกับ: "${keyword}"`;
    document.getElementById('dream-reveal-meaning').textContent = result.meaning;
    document.getElementById('dream-num-2').textContent = result.num2;
    document.getElementById('dream-num-3').textContent = result.num3;
    
    document.getElementById('dream-result-box').classList.remove('hidden');
    MysticAudio.playSuccess();
  });
});


// ==========================================================================
// DAILY AUSPICIOUS OUTFIT COLORS DATABASE (AUTHENTIC THAI ASTROLOGICAL DATA)
// ==========================================================================
const OUTFIT_COLOR_DATABASE = {
  "Sunday": {
    name: "คนเกิดวันอาทิตย์ 🔴",
    career: "สีแดง, สีชมพู 💖",
    wealth: "สีเขียวเข้ม, สีทอง 🟢🪙",
    love: "สีดำ, สีเทาเข้ม 🖤",
    health: "สีเหลือง, สีส้ม 🟡🍊",
    taboo: "สีน้ำเงิน, สีฟ้า 🔵 (กาลกิณีห้ามใส่!)"
  },
  "Monday": {
    name: "คนเกิดวันจันทร์ 🟡",
    career: "สีเขียว, สีครีม 🟢🤍",
    wealth: "สีม่วง, สีส้ม 🟣🍊",
    love: "สีน้ำเงิน, สีฟ้า 🔵",
    health: "สีชมพู, สีเขียว 💗",
    taboo: "สีแดง 🔴 (กาลกิณีห้ามใส่!)"
  },
  "Tuesday": {
    name: "คนเกิดวันอังคาร 💗",
    career: "สีม่วง, สีชมพู 🟣💗",
    wealth: "สีดำ, สีเทา 🖤",
    love: "สีแดง, สีชมพู 🔴",
    health: "สีเขียว, สีเหลือง 🟢",
    taboo: "สีขาว, สีเหลือง 🟡 (กาลกิณีห้ามใส่!)"
  },
  "Wednesday": {
    name: "คนเกิดวันพุธ 🟢",
    career: "สีเขียว, สีส้ม 🟢🍊",
    wealth: "สีเหลือง, สีทอง 🟡🪙",
    love: "สีน้ำเงิน, สีฟ้า 🔵",
    health: "สีดำ, สีเทาดำ 🖤",
    taboo: "สีชมพู 💗 (กาลกิณีห้ามใส่!)"
  },
  "Thursday": {
    name: "คนเกิดวันพฤหัสบดี 🟠",
    career: "สีส้ม, สีเหลือง 🍊🟡",
    wealth: "สีแดง, สีทอง 🔴🪙",
    love: "สีเขียว, สีส้ม 🟢",
    health: "สีน้ำเงิน, สีฟ้า 🔵",
    taboo: "สีดำ, สีม่วง 🟣 (กาลกิณีห้ามใส่!)"
  },
  "Friday": {
    name: "คนเกิดวันศุกร์ 🔵",
    career: "สีน้ำเงิน, สีฟ้า 🔵",
    wealth: "สีชมพู, สีแดง 💗🔴",
    love: "สีเหลือง, สีส้ม 🟡",
    health: "สีขาว, สีทอง 🤍🪙",
    taboo: "สีเทาเข้ม, สีม่วง 🟣 (กาลกิณีห้ามใส่!)"
  },
  "Saturday": {
    name: "คนเกิดวันเสาร์ 🟣",
    career: "สีดำ, สีเทา 🖤",
    wealth: "สีน้ำเงิน, สีฟ้า 🔵",
    love: "สีชมพู, สีม่วง 💗",
    health: "สีแดง, สีดำ 🔴",
    taboo: "สีเขียว 🟢 (กาลกิณีห้ามใส่!)"
  }
};

const btnSubmitOutfit = document.getElementById('btn-submit-outfit');
if (btnSubmitOutfit) {
  btnSubmitOutfit.addEventListener('click', () => {
    const day = document.getElementById('select-outfit-birthday').value;
    const result = OUTFIT_COLOR_DATABASE[day];
    
    document.getElementById('outfit-reveal-title').textContent = `👕 เสื้อสีมงคลเสริมชะตาของ: ${result.name}`;
    document.getElementById('outfit-career').textContent = result.career;
    document.getElementById('outfit-wealth').textContent = result.wealth;
    document.getElementById('outfit-love').textContent = result.love;
    document.getElementById('outfit-health').textContent = result.health;
    
    const tabooEl = document.getElementById('outfit-taboo');
    if (tabooEl) {
      tabooEl.textContent = result.taboo;
      tabooEl.style.color = '#ff4d4d';
    }
    
    document.getElementById('outfit-result-box').classList.remove('hidden');
    MysticAudio.playSuccess();
  });
}


// ==========================================================================
// TRADITIONAL THAI LIFE GRAPH CALCULATOR (HIGHLY ACCURATE NUMEROLOGY)
// ==========================================================================
const LIFE_GRAPH_CATEGORIES = [
  { name: "วาสนา (Destiny)", color: "#fde047", desc: "ชะตาชีวิตโดยทั่วไป ความสงบสุข วาสนาบุญบารมีสะสม" },
  { name: "ทรัพย์ (Wealth)", color: "#38bdf8", desc: "โชคลาภการเงิน ความมั่นคงทางฐานะ ทรัพย์สินเงินทอง" },
  { name: "เพื่อนบ้าน (Social)", color: "#c084fc", desc: "ความสัมพันธ์กับบุคคลรอบตัว เพื่อนฝูง สังคม และกัลยาณมิตร" },
  { name: "ญาติ (Family)", color: "#e2e8f0", desc: "ความเกื้อหนุนจุนเจือจากครอบครัว พ่อแม่ พี่น้อง" },
  { name: "บุตร (Children)", color: "#f472b6", desc: "บุตรธิดา บริวารรุ่นใหม่ ความหวังใหม่และผู้สืบทอด" },
  { name: "บริวาร (Followers)", color: "#38bdf8", desc: "คนรับใช้ ลูกน้อง หรือผู้รับใช้อุปถัมภ์ที่คอยสนับสนุน" },
  { name: "ศัตรู (Obstacles)", color: "#fb7185", desc: "อุปสรรคขัดขวาง คดีความ หรือคนขัดขาปองร้าย" },
  { name: "คู่ครอง (Spouse)", color: "#f472b6", desc: "ความรัก ชีวิตแต่งงาน คู่ครอง คนรัก หรือคู่สัญญาทำงาน" },
  { name: "โรคภัย (Health)", color: "#fb7185", desc: "สุขภาพร่างกาย โรคประจำตัว หรืออันตรายจากอุบัติเหตุ" },
  { name: "การงาน (Career)", color: "#c084fc", desc: "ตำแหน่งหน้าที่การงาน ความสำเร็จในการค้าขายหรือรับราชการ" },
  { name: "ลาภยศ (Luck & Honor)", color: "#fde047", desc: "เกียรติยศชื่อเสียง โชคลาภก้อนโตจากการเสี่ยงโชค" },
  { name: "เจริญสุข (Happiness)", color: "#4ade80", desc: "ความสุขทางจิตใจ ความสำเร็จในปลายชีวิต ความร่มเย็น" }
];

function calculateLifeGraph(weekday, date, month, year, beYear) {
  const scores = [];
  for (let i = 0; i < 12; i++) {
    let baseScore = (weekday + month + date + year + (beYear % 12) + (i * 3)) % 12;
    if (baseScore === 0) baseScore = 12;
    scores.push(baseScore);
  }
  return scores;
}

const selectBeYear = document.getElementById('select-lg-be-year');
if (selectBeYear) {
  for (let y = 2570; y >= 2500; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = `พ.ศ. ${y}`;
    selectBeYear.appendChild(opt);
  }
  selectBeYear.value = "2540";

  selectBeYear.addEventListener('change', () => {
    const beYearVal = parseInt(selectBeYear.value);
    let zodiacIdx = (beYearVal - 2538) % 12;
    if (zodiacIdx <= 0) zodiacIdx += 12;
    
    const selectZodiac = document.getElementById('select-lg-year');
    if (selectZodiac) {
      selectZodiac.value = String(zodiacIdx);
    }
  });
}

const btnSubmitLifeGraph = document.getElementById('btn-submit-lifegraph');
if (btnSubmitLifeGraph) {
  btnSubmitLifeGraph.addEventListener('click', () => {
    const weekday = parseInt(document.getElementById('select-lg-weekday').value);
    const date = parseInt(document.getElementById('select-lg-date').value);
    const month = parseInt(document.getElementById('select-lg-month').value);
    const year = parseInt(document.getElementById('select-lg-year').value);
    const beYear = parseInt(document.getElementById('select-lg-be-year').value) || 2540;
    
    const scores = calculateLifeGraph(weekday, date, month, year, beYear);
    const container = document.getElementById('lifegraph-bars-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    LIFE_GRAPH_CATEGORIES.forEach((cat, index) => {
      const score = scores[index];
      let scoreText = '✨ ดวงปานกลาง';
      let barGradient = 'linear-gradient(90deg, #8b5cf6, #06b6d4)';
      let barGlow = 'rgba(6, 182, 212, 0.55)';
      let scoreColor = '#67e8f9';

      if (score >= 9) {
        scoreText = '🔥 ดวงดีเลิศ';
        barGradient = 'linear-gradient(90deg, #f59e0b, #fde047)';
        barGlow = 'rgba(250, 204, 21, 0.65)';
        scoreColor = '#fde047';
      } else if (score <= 4) {
        scoreText = '⚠️ ต้องระวัง';
        barGradient = 'linear-gradient(90deg, #e11d48, #fb7185)';
        barGlow = 'rgba(244, 63, 94, 0.6)';
        scoreColor = '#fb7185';
      }
      
      const barWrapper = document.createElement('div');
      barWrapper.style.margin = '8px 0';
      barWrapper.style.padding = '12px 14px';
      barWrapper.style.background = 'rgba(15, 10, 35, 0.65)';
      barWrapper.style.border = '1px solid rgba(139, 92, 246, 0.25)';
      barWrapper.style.borderRadius = '10px';
      
      barWrapper.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-size: 0.92rem; gap: 8px; flex-wrap: wrap;">
          <span style="font-weight: 600; color: ${cat.color};">${cat.name}</span>
          <span style="font-weight: 700; color: ${scoreColor};">${score} คะแนน (${scoreText})</span>
        </div>
        <div style="width: 100%; height: 10px; background: rgba(255,255,255,0.1); border-radius: 999px; overflow: hidden; margin-bottom: 6px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="width: ${(score / 12) * 100}%; height: 100%; background: ${barGradient}; border-radius: 999px; box-shadow: 0 0 10px ${barGlow}; transition: width 0.6s ease;"></div>
        </div>
        <div style="font-size: 0.78rem; color: #cbd5e1; line-height: 1.35;">${cat.desc}</div>
      `;
      
      container.appendChild(barWrapper);
    });
    
    document.getElementById('lifegraph-result-box').classList.remove('hidden');
    MysticAudio.playSuccess();
  });
}

// ==========================================================================
// MAE MHO PAM'S COMFORT CHATBOT LOGIC (FRONTEND AI SHUFFLE ENGINE)
// ==========================================================================
let chatHistory = [];

function resetChatMessages() {
  chatHistory = [];
  const box = document.getElementById('chat-messages-box');
  if (box) {
    box.innerHTML = `
      <!-- Initial Mae Mho Pam Message -->
      <div class="chat-bubble pam">
        <div class="bubble-avatar">
          <img src="/images/pam_mascot.png" alt="Pam">
        </div>
        <div class="bubble-content">
          <div class="bubble-text">
            สวัสดีจ้าเด็กๆ! มีเรื่องกังวลใจหรือเหงาอะไรอยู่หรือเปล่าจ๊ะ? พิมพ์มาเล่าให้ฟังได้เลยนะ หรือกดปุ่มด้านล่างถามคำถามด่วนได้เลยจ้า! 💕🔮
          </div>
        </div>
      </div>
    `;
  }
  const input = document.getElementById('input-chat-message');
  if (input) input.value = '';
}

// Function to handle chatbot reply logic (Smart local engine)
function getChatbotReply(userText) {
  const text = String(userText || '').trim().toLowerCase();

  // Simple math expression check (e.g. "1+1", "5*5", etc.)
  const match = text.replace(/\s+/g, '').match(/^(\d+)([\+\-\*\/])(\d+)$/);
  if (match) {
    const num1 = parseFloat(match[1]);
    const op = match[2];
    const num2 = parseFloat(match[3]);
    let result = 0;
    if (op === '+') result = num1 + num2;
    else if (op === '-') result = num1 - num2;
    else if (op === '*') result = num1 * num2;
    else if (op === '/') result = num2 !== 0 ? +(num1 / num2).toFixed(2) : "หาค่าไม่ได้จ้า";
    return `ข้อนี้ง่ายม๊ากกก! ${num1} ${op} ${num2} ได้คำตอบเท่ากับ ${result} จ้า! ถามเลขเด็ดงวดนี้แม่หมอก็คำนวณให้ได้นะจ๊ะ 🧠✨`;
  }

  // 1. Lucky outfit colors (สีเสื้อมงคล)
  if (text.includes('สีเสื้อ') || text.includes('สีมงคล') || text.includes('ใส่สีอะไร')) {
    const dayNames = ['วันอาทิตย์ 🔴', 'วันจันทร์ 🟡', 'วันอังคาร 💗', 'วันพุธ 🟢', 'วันพฤหัสบดี 🟠', 'วันศุกร์ 🔵', 'วันเสาร์ 🟣'];
    const dayColors = [
      'เสริมงาน: สีแดง/ชมพู | เรียกทรัพย์: สีเขียว/ทอง | เมตตา: สีดำ/เทา | เลี่ยง: สีน้ำเงิน',
      'เสริมงาน: สีเขียว/ครีม | เรียกทรัพย์: สีม่วง/ส้ม | เมตตา: สีฟ้า/น้ำเงิน | เลี่ยง: สีแดง',
      'เสริมงาน: สีม่วง/ชมพู | เรียกทรัพย์: สีดำ/เทา | เมตตา: สีแดง | เลี่ยง: สีขาว/เหลือง',
      'เสริมงาน: สีเขียว/ส้ม | เรียกทรัพย์: สีเหลือง/ทอง | เมตตา: สีฟ้า/น้ำเงิน | เลี่ยง: สีชมพู',
      'เสริมงาน: สีส้ม/เหลือง | เรียกทรัพย์: สีแดง/ทอง | เมตตา: สีเขียว | เลี่ยง: สีดำ/ม่วง',
      'เสริมงาน: สีฟ้า/น้ำเงิน | เรียกทรัพย์: สีชมพู/แดง | เมตตา: สีเหลือง/ส้ม | เลี่ยง: สีเทาเข้ม',
      'เสริมงาน: สีดำ/เทา | เรียกทรัพย์: สีฟ้า/น้ำเงิน | เมตตา: สีชมพู/ม่วง | เลี่ยง: สีเขียว'
    ];
    const d = new Date().getDay();
    return `👕 สีเสื้อมงคลประจำ${dayNames[d]}นี้จ้า! ✨ ${dayColors[d]} ใส่ตามนี้รับรองเดินสับๆ รับทรัพย์ตลอดวันเลยนะจ๊ะ! 💖`;
  }

  // 2. Lucky numbers / Lottery (เลขนำโชค / เลขเด็ด / หวย)
  if (text.includes('เลขนำโชค') || text.includes('เลขเด็ด') || text.includes('หวย') || text.includes('ขอเลข')) {
    const n2 = String(Math.floor(Math.random() * 90) + 10);
    const n3 = String(Math.floor(Math.random() * 900) + 100);
    return `🍀 เพี้ยง! จิตสัมผัสแม่หมอแพมและพี่หมูแด็บส่องเห็นเลขมงคลประจำตัวหนูวันนี้คือ เลข 2 ตัว: 【 ${n2} 】 และเลข 3 ตัว: 【 ${n3} 】 จ้า! ขอให้โชคใหญ่หล่นทับรับทรัพย์เต็มกระเป๋านะจ๊ะ! 💸✨`;
  }

  // 3. Comfort / Hug / Bad luck (กอดปลอบใจ / ดวงไม่ดี / เศร้า / เหนื่อย / ท้อ / เครียด)
  if (text.includes('กอด') || text.includes('ปลอบใจ') || text.includes('ดวงไม่ดี') || text.includes('เศร้า') || text.includes('เหนื่อย') || text.includes('ท้อ') || text.includes('เครียด') || text.includes('ร้องไห้')) {
    const comforts = [
      'โอ๋ๆ มานี่มา แม่หมอแพมขอกอดแน่นๆ ทีนึงนะจ๊ะ 🤗💖 วันนี้เหนื่อยมามากแล้วใช่ไหมคนเก่ง เรื่องร้ายๆ ที่เจอมันแค่ผ่านมาแล้วก็ผ่านไป หลังจากวินาทีนี้กราฟดวงของหนูกำลังจะพุ่งขึ้นแล้วนะ ยิ้มเยอะๆ นะจ๊ะ!',
      'กอดปุๆ นะคนเก่งของแม่หมอ! 🥺✨ ดาวเคราะห์ร้ายกำลังโคจรออกไปแล้วจ้า ไม่ต้องคิดมากนะ วันนี้พักใจฟังเพลงสบายๆ กินของอร่อยๆ แล้วพรุ่งนี้เตรียมรับข่าวดีได้เลย แม่หมอและพี่หมูแด็บอยู่ข้างๆ เสมอจ้า 🐷💕',
      'เพี้ยง! แม่หมอเป่ามนต์ปัดเป่าความเศร้าออกไปให้หมดเลยนะจ๊ะ 🪄✨ หนูเก่งมากๆ แล้วที่ผ่านวันนี้มาได้ อย่าลืมใจดีกับตัวเองเยอะๆ นะ ความสุขก้อนใหญ่กำลังเดินทางมาหาหนูแล้วจ้า!'
    ];
    return comforts[Math.floor(Math.random() * comforts.length)];
  }

  // 4. Food suggestion (กินของอร่อย / หิว / อาหาร)
  if (text.includes('กิน') || text.includes('อร่อย') || text.includes('หิว') || text.includes('อาหาร') || text.includes('เมนู')) {
    const foods = [
      'หมูกระทะร้อนๆ ย่างหมูสามชั้นเกรียมๆ จิ้มน้ำจิ้มรสเด็ด 🥓🔥 กินแล้วพลังธาตุไฟพุ่ง กระตุ้นดวงการเงินสุดๆ จ้า!',
      'ชาบูซุปน้ำดำหอมๆ กับเนื้อสไลซ์นุ่มๆ 🍲✨ กินของอุ่นๆ ช่วยเสริมพลังธาตุน้ำ ให้จิตใจชุ่มชื้นและดึงดูดคนอุปถัมภ์นะจ๊ะ!',
      'ชานมไข่มุกหวานกำลังดีสักแก้วคู่กับไก่ทอดกรอบๆ 🧋🍗 เติมความหวานให้ชีวิต ดวงความรักและเมตตามหานิยมจะได้พุ่งกระฉูดจ้า!',
      'ส้มตำปูปลาร้าแซ่บๆ คอหมูย่างข้าวเหนียวร้อนๆ 🥗🌶️ ความแซ่บจะช่วยปลุกเอเนอร์จี้และปัดเป่าความซึมเศร้าออกไปทันทีเลยจ้า!'
    ];
    return foods[Math.floor(Math.random() * foods.length)];
  }

  // 5. Wealth tricks / Money (ทริคเรียกทรัพย์ / โชคลาภ / การเงิน / เงิน)
  if (text.includes('เรียกทรัพย์') || text.includes('โชคลาภ') || text.includes('นักษัตร') || text.includes('การเงิน') || text.includes('รวย') || text.includes('เงิน')) {
    const wealthTips = [
      '💸 ทริคเรียกทรัพย์ฉบับแม่หมอแพม: แนะนำให้จัดเรียงธนบัตรในกระเป๋าสตางค์ให้หันหัวขึ้นทุกใบ ลบใบเสร็จเก่าๆ ทิ้ง และพกแบงก์ขวัญถุงที่ลงท้ายด้วยเลข 8 หรือ 9 จะช่วยดูดเงินก้อนเข้ากระเป๋ารัวๆ เลยจ้า! ✨',
      '🪙 เคล็ดลับเปิดดวงเศรษฐีวันนี้: ก่อนออกจากบ้านให้ยิ้มหน้ากระจกแล้วพูดว่า "วันนี้เงินไหลมาเทมา" พร้อมทำความสะอาดหน้าจอโทรศัพท์ให้ใสปิ๊ง เพราะมือถือคือประตูรับทรัพย์ยุคดิจิทัลจ้า! 📱💰',
      '🌟 คาถาเสริมโชคลาภด่วน: วันนี้ลองแบ่งเงินเล็กๆ น้อยๆ ทำบุญออนไลน์หรือหยอดตู้บริจาค แล้วอธิษฐานขอพรพระสีวลี รับรองว่าจะมีลาภลอยหรือข่าวดีเรื่องเงินเข้ามาแบบไม่ทันตั้งตัวนะจ๊ะ!'
    ];
    return wealthTips[Math.floor(Math.random() * wealthTips.length)];
  }

  // 6. Jokes / Playful banter (คุยเล่น / มุกกวนๆ / ตลก / เหงา)
  if (text.includes('คุยเล่น') || text.includes('มุก') || text.includes('กวน') || text.includes('ตลก') || text.includes('เหงา')) {
    const jokes = [
      '🃏 แม่หมอเช็กดวงให้แล้วนะ... ดวงหนูช่วงนี้มีเกณฑ์เสียทรัพย์หนักมาก! โดยเฉพาะเวลาเปิดแอปสั่งอาหารตอนเที่ยงคืนกับแอปช้อปปิ้งตอนโปรสิ้นเดือน ฮ่าๆๆ 🛒🍕',
      '🐷 พี่หมูแด็บฝากถามว่า: "เป็นหมอดูต้องดูดวง แต่ถ้าอยากเป็นคนในใจเธอต้องดูตรงไหนจ๊ะ?" ฮิ้ววว! เขินเลยล่ะสิ! 💕✨',
      '🔮 คำทำนายด่วนจากลูกแก้ว: เนื้อคู่ของหนูเป็นคนมีฐานะดีมาก... แต่ตอนนี้เขากำลังหลงทางอยู่แถวๆ ร้านชาบู ถ้าหนูออกไปกินของอร่อยบ่อยๆ เดี๋ยวก็ได้เจอกันเองจ้า! 😆🍲'
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  // 7. Love / Ex / Relationship
  if (text.includes('รัก') || text.includes('แฟน') || text.includes('คนคุย') || text.includes('อกหัก') || text.includes('โสด') || text.includes('เนื้อคู่')) {
    const loveReplies = [
      '💘 ดวงความรักของหนูช่วงนี้เสน่ห์แรงอยู่นะจ๊ะ! คนโสดมีเกณฑ์เจอคนถูกใจจากการเดินทางหรือโลกออนไลน์ ส่วนถ้าใครทำหนูเสียใจ แม่หมอแนะนำให้เชิดหน้าสวยๆ เพราะคนใหม่ที่จะเข้ามาดีและเปย์เก่งกว่าเดิมแน่นอนจ้า! ✨',
      '💖 เรื่องหัวใจไม่ต้องรีบร้อนนะจ๊ะ ดาวศุกร์กำลังโคจรมาเสริมเสน่ห์ให้หนูแล้ว ช่วงนี้ยิ่งดูแลตัวเองให้สดใสอารมณ์ดี พลังดึงดูดคนที่ใช่ก็จะยิ่งทำงานแรงขึ้นร้อยเท่าเลยจ้า!'
    ];
    return loveReplies[Math.floor(Math.random() * loveReplies.length)];
  }

  // 8. Work / Study
  if (text.includes('งาน') || text.includes('เรียน') || text.includes('สอบ') || text.includes('โปรเจกต์')) {
    return '💼✨ ดวงการงานและการเรียนของหนูช่วงนี้ แม้จะมีเรื่องให้เหนื่อยหรือต้องแก้ปัญหาเฉพาะหน้าบ้าง แต่ด้วยไหวพริบของหนูจะผ่านไปได้แบบปังมากจ้า! ผู้ใหญ่และคนรอบข้างพร้อมซัพพอร์ต ลุยได้เลยนะจ๊ะ!';
  }

  // 9. Greeting & General Questions
  if (text.includes('สวัสดี') || text.includes('หวัดดี') || text.includes('hello') || text.includes('hi')) {
    return "สวัสดีจ้าคนเก่ง! 🔮✨ วันนี้อยากให้แม่หมอแพมช่วยเช็กสีเสื้อมงคล ขอเลขนำโชค ปลอบใจ หรือชวนคุยเรื่องความรัก/การเงิน พิมพ์บอกแม่หมอได้เลยนะจ๊ะ! 💖";
  }

  if (text.includes('ทำอะไรอยู่') || text.includes('ทำไรอยู่')) {
    return "กำลังนั่งขัดลูกแก้วรอคุยเล่นแก้ง่วงกับหนูอยู่นี่แหละจ้า มีเรื่องอะไรเล่าให้ฟังไหมจ๊ะ? 🔮✨";
  }

  if (text.includes('ชื่ออะไร') || text.includes('ชื่อไร')) {
    return "แม่หมอชื่อ 'แม่หมอแพม' จ้า ส่วนน้องกลมๆ ที่บินลอยไปลอยมาข้างๆ คือ 'พี่หมูแด็บ' จ้า 🐷💕";
  }

  // Generic warm & engaging fallbacks
  const fallbacks = [
    `แม่หมอแพมฟังอยู่นะจ๊ะ! 🔮✨ เรื่องที่หนูพิมพ์มา "${userText}" น่าสนใจมากเลย ดวงชะตาช่วงนี้ขอแค่หนูมั่นใจและคิดบวก สิ่งดีๆ กำลังจะเข้ามาแน่นอนจ้า มีเรื่องไหนอยากเล่าเพิ่มอีกไหมจ๊ะ? 💖`,
    "รับทราบเลยจ้าคนดี! 😊✨ แม่หมอและพี่หมูแด็บขอส่งพลังบวกให้หนูแบบจัดเต็มร้อยเปอร์เซ็นต์เลยนะ อยากถามเรื่องความรัก การเงิน สีมงคล หรือให้แม่หมอปล่อยมุกฮาๆ กดปุ่มด้านล่างหรือพิมพ์มาได้เลยนะจ๊ะ! 🐷💕",
    "เพี้ยง! ✨ แม่หมอสัมผัสได้ถึงพลังงานดีๆ จากตัวหนูนะเนี่ย! ไม่ว่าจะเจอเรื่องอะไรอยู่ ขอให้วันนี้เป็นวันที่ยิ้มได้กว้างๆ และมีแต่โชคลาภวิ่งเข้าหานะจ๊ะ คุยกับแม่หมอต่อได้ยาวๆ เลยจ้า! 🌟"
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

// Function to send a message
function sendChatMessage(text) {
  if (!text || text.trim() === '') return;
  
  const messagesBox = document.getElementById('chat-messages-box');
  if (!messagesBox) return;
  
  // 1. Append User Bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-bubble user';
  userBubble.innerHTML = `
    <div class="bubble-avatar">
      <img src="/images/esiimsi_cup.jpg" alt="User">
    </div>
    <div class="bubble-content">
      <div class="bubble-text">${text}</div>
    </div>
  `;
  messagesBox.appendChild(userBubble);
  
  // Play sound
  MysticAudio.playClick();
  
  // Clear input
  const inputEl = document.getElementById('input-chat-message');
  if (inputEl) inputEl.value = '';
  
  // Scroll to bottom
  messagesBox.scrollTop = messagesBox.scrollHeight;
  
  // 2. Add Typing Indicator Bubble
  const typingBubble = document.createElement('div');
  typingBubble.className = 'chat-bubble pam typing-indicator-bubble-wrapper';
  typingBubble.innerHTML = `
    <div class="bubble-avatar">
      <img src="/images/pam_mascot.png" alt="Pam">
    </div>
    <div class="bubble-content">
      <div class="typing-indicator-bubble">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    </div>
  `;
  messagesBox.appendChild(typingBubble);
  messagesBox.scrollTop = messagesBox.scrollHeight;

  // Add to local chat memory
  chatHistory.push({ role: 'user', text });
  
  // 3. Request AI response from server with fallback to local engine
  fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: text,
      history: chatHistory
    })
  })
  .then(res => res.json())
  .then(data => {
    // Remove typing indicator
    const indicator = messagesBox.querySelector('.typing-indicator-bubble-wrapper');
    if (indicator) indicator.remove();
    
    const replyText = data.reply;
    
    // Append Pam Bubble
    const pamBubble = document.createElement('div');
    pamBubble.className = 'chat-bubble pam';
    pamBubble.innerHTML = `
      <div class="bubble-avatar">
        <img src="/images/pam_mascot.png" alt="Pam">
      </div>
      <div class="bubble-content">
        <div class="bubble-text">${replyText}</div>
      </div>
    `;
    messagesBox.appendChild(pamBubble);
    
    // Add to history
    chatHistory.push({ role: 'model', text: replyText });
    
    // Play Success sound
    MysticAudio.playSuccess();
    
    // Scroll to bottom
    messagesBox.scrollTop = messagesBox.scrollHeight;
  })
  .catch(err => {
    console.warn("Fallback to local chatbot responses:", err);
    
    // Fallback delay simulation
    setTimeout(() => {
      // Remove typing indicator
      const indicator = messagesBox.querySelector('.typing-indicator-bubble-wrapper');
      if (indicator) indicator.remove();
      
      const replyText = getChatbotReply(text);
      
      const pamBubble = document.createElement('div');
      pamBubble.className = 'chat-bubble pam';
      pamBubble.innerHTML = `
        <div class="bubble-avatar">
          <img src="/images/pam_mascot.png" alt="Pam">
        </div>
        <div class="bubble-content">
          <div class="bubble-text">${replyText}</div>
        </div>
      `;
      messagesBox.appendChild(pamBubble);
      
      chatHistory.push({ role: 'model', text: replyText });
      
      MysticAudio.playSuccess();
      messagesBox.scrollTop = messagesBox.scrollHeight;
    }, 1200);
  });
}

// Bind Chat Actions
const btnSendChat = document.getElementById('btn-send-chat');
if (btnSendChat) {
  btnSendChat.addEventListener('click', () => {
    const inputEl = document.getElementById('input-chat-message');
    if (inputEl) {
      sendChatMessage(inputEl.value);
    }
  });
}

const inputChatMessage = document.getElementById('input-chat-message');
if (inputChatMessage) {
  inputChatMessage.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      sendChatMessage(inputChatMessage.value);
    }
  });
}

// Bind quick suggestions click events
document.querySelectorAll('#chat-quick-suggestions .chat-badge').forEach(badge => {
  badge.addEventListener('click', () => {
    const msg = badge.getAttribute('data-msg');
    sendChatMessage(msg);
  });
});

// ==========================================================================
// ON DOM LOAD INITIALIZATION
// ==========================================================================
function initializeApp() {
  initMyDuangFeatures();
  // Start star particles background
  StarBg.init('star-canvas');

  // URL parsing helper for quick joining
  const urlParams = new URLSearchParams(window.location.search);
  const roomParam = urlParams.get('room');
  if (roomParam && typeof io !== 'undefined') {
    showSection('sec-player-join');
    setupJoinView();
    const roomCodeInput = document.getElementById('input-room-code');
    if (roomCodeInput) roomCodeInput.value = roomParam;
  }

  // Angel Pam Mascot Interaction
  const mascotPam = document.getElementById('mascot-pam');
  const speechBubble = document.getElementById('pam-speech');
  const speechText = document.getElementById('pam-speech-text');
  let speechTimeout = null;

  const pamQuotes = [
    "เพี้ยง! วันนี้ดวงจะดี มีแต่เงินทองไหลมาเทมานะจ๊ะ 💸",
    "วันนี้ทำตัวน่ารักหรือยัง? นางฟ้ามองว่าดวงคุณอยู่ในเกรด A+ เลยนะ! ✨",
    "พักผ่อนบ้างนะจ๊ะ อย่ามัวแต่เคร่งเครียดจนหลังตึงล่ะ ปล.วันนี้ความรักเด่นมากนะ 🥰",
    "ชวนเพื่อนๆ ในกลุ่มแชร์เว็บ 'ดวงปังพลังแพม' มาเล่นกันเยอะๆ นะ เสริมความโชคดี! 💘",
    "วันนี้มีลาภปากนะจ๊ะ จะมีคนพาไปเลี้ยงของอร่อย อิ่มสบายท้องแน่นอน 🍕",
    "เพี้ยง! ขอปัดเป่าเคราะห์ร้ายออกจากเพื่อนๆ ทุกคนในวงปาร์ตี้จ้า 🔮"
  ];

  if (mascotPam && speechBubble && speechText) {
    mascotPam.addEventListener('click', (e) => {
      // Prevent triggers when clicking inside bubble text
      if (e.target.closest('#pam-speech')) return;

      const randomQuote = pamQuotes[Math.floor(Math.random() * pamQuotes.length)];
      speechText.textContent = randomQuote;
      
      // Toggle speech
      if (speechBubble.classList.contains('hidden')) {
        speechBubble.classList.remove('hidden');
        MysticAudio.playSuccess();
      } else {
        speechBubble.classList.add('hidden');
        MysticAudio.playClick();
      }

      // Auto hide after 6 seconds
      clearTimeout(speechTimeout);
      speechTimeout = setTimeout(() => {
        speechBubble.classList.add('hidden');
      }, 6000);
    });
  }

  // Dabbing Pig Mascot Interaction
  const mascotPig = document.getElementById('lobby-pig');
  const pigSpeechBubble = document.getElementById('pig-speech');
  const pigSpeechText = document.getElementById('pig-speech-text');
  let pigSpeechTimeout = null;

  const pigQuotes = [
    "สวัสดีวัยรุ่น! วันนี้ขอให้ดวงแข็งดั่งเหล็กกล้า! 🐷🔥",
    "ดวงวันนี้พร้อมชนทุกโชคลาภจ้า! แด็บทีนึงเสริมสิริมงคล! 🕶️",
    "ถ้าเงินในกระเป๋ามันโล่ง มาดูดวงกู้ชีพกับหมอดูแพมด่วนๆ! 💸",
    "แด็บซ้าย แด็บขวา... วันนี้โชคลาภวิ่งมาชนแน่นอนจ้าวัยรุ่น! 🚀",
    "กินอิ่ม นอนอุ่น หุ่นดีแบบพี่หมูนะจ๊ะ 🍕😴",
    "เพี้ยง! มูเตลูกันยาวๆ ดับเบิ้ลแด็บรับเงินแสนจ้าพี่ๆ 💰"
  ];

  if (mascotPig && pigSpeechBubble && pigSpeechText) {
    mascotPig.addEventListener('click', (e) => {
      // Prevent triggers when clicking inside bubble text
      if (e.target.closest('#pig-speech')) return;

      const randomQuote = pigQuotes[Math.floor(Math.random() * pigQuotes.length)];
      pigSpeechText.textContent = randomQuote;
      
      // Trigger funny 360 spin animation
      mascotPig.classList.add('spin-active');
      setTimeout(() => {
        mascotPig.classList.remove('spin-active');
      }, 750); // Remove class after spin animation ends (0.75s)

      // Toggle speech bubble
      if (pigSpeechBubble.classList.contains('hidden')) {
        pigSpeechBubble.classList.remove('hidden');
        MysticAudio.playSuccess();
      } else {
        pigSpeechBubble.classList.add('hidden');
        MysticAudio.playClick();
      }

      // Auto hide after 6 seconds
      clearTimeout(pigSpeechTimeout);
      pigSpeechTimeout = setTimeout(() => {
        pigSpeechBubble.classList.add('hidden');
      }, 6000);
    });
  }

  // Walking Duck Mascot Interaction
  const mascotDuck = document.getElementById('lobby-duck');
  const duckSpeechBubble = document.getElementById('duck-speech');
  const duckSpeechText = document.getElementById('duck-speech-text');
  let duckSpeechTimeout = null;

  const duckQuotes = [
    "ก๊าบ! วันนี้ดวงดีมีโชคจ้าวัยรุ่น! 🦆💰",
    "มองหน้าหาเรื่องกวักเงินกวักทองหรอจ๊ะ! ก๊าบๆ! 🔮✨",
    "ขอให้ดวงดี ปังเปรี้ยงปร้าง แซงหน้าพี่หมูแด็บไปเลยนะจ๊ะ! 🦆🔥",
    "ก๊าบๆ! แอบมองเธอนะจ๊ะแต่เธอไม่รู้หรอก คิกคิก 🐷💕",
    "เพี้ยง! วันนี้เดินกวักเงินสิบล้านเข้าบ้านจ้าพี่ๆ! 💰🏡",
    "เป็ดสวมวิกผมทรงเท่ขนาดนี้... วันนี้ดวงคุณต้องเท่ระเบิดแน่นอน! 😎"
  ];

  if (mascotDuck && duckSpeechBubble && duckSpeechText) {
    mascotDuck.addEventListener('click', (e) => {
      // Prevent triggers when clicking inside bubble text
      if (e.target.closest('#duck-speech')) return;

      const randomQuote = duckQuotes[Math.floor(Math.random() * duckQuotes.length)];
      duckSpeechText.textContent = randomQuote;

      mascotDuck.classList.add('spin-active');
      setTimeout(() => {
        mascotDuck.classList.remove('spin-active');
      }, 750);

      if (duckSpeechBubble.classList.contains('hidden')) {
        duckSpeechBubble.classList.remove('hidden');
        MysticAudio.playSuccess();
      } else {
        duckSpeechBubble.classList.add('hidden');
        MysticAudio.playClick();
      }

      clearTimeout(duckSpeechTimeout);
      duckSpeechTimeout = setTimeout(() => {
        duckSpeechBubble.classList.add('hidden');
      }, 6000);
    });
  }

  // Walking Lizard Mascot Interaction
  const mascotLizard = document.getElementById('lobby-lizard');
  const lizardSpeechBubble = document.getElementById('lizard-speech');
  const lizardSpeechText = document.getElementById('lizard-speech-text');
  let lizardSpeechTimeout = null;

  const lizardQuotes = [
    "กิ๊กๆ! วันนี้เฮงๆ ปังๆ จ้าวัยรุ่น! 🦎💚",
    "มองหน้าหาเรื่องเสริมพลังธาตุสีเขียวหรอจ๊ะ! 🦎✨",
    "ขอให้โชคดี มีเงินไหลมาเทมาดั่งหางกิ้งก่าที่งอกใหม่เรื่อยๆ! 💰🦎",
    "กิ๊กๆ! แดดเมืองไทยแรงจนกิ้งก่าอยากส้มปาก แต่ดวงคุณจะส้มหล่นทับเงินแสนแทนจ้า! 🍊💸",
    "เพี้ยง! วันนี้เดินกวักความร่ำรวยร้อยล้านจ้าพี่ๆ! 💰🔥",
    "กิ้งก่าเขียวเหนี่ยวทรัพย์มาโปรยถึงหน้าบ้านแล้วจ้า! 🏡💸"
  ];

  if (mascotLizard && lizardSpeechBubble && lizardSpeechText) {
    mascotLizard.addEventListener('click', (e) => {
      // Prevent triggers when clicking inside bubble text
      if (e.target.closest('#lizard-speech')) return;

      const randomQuote = lizardQuotes[Math.floor(Math.random() * lizardQuotes.length)];
      lizardSpeechText.textContent = randomQuote;

      mascotLizard.classList.add('spin-active');
      setTimeout(() => {
        mascotLizard.classList.remove('spin-active');
      }, 750);

      if (lizardSpeechBubble.classList.contains('hidden')) {
        lizardSpeechBubble.classList.remove('hidden');
        MysticAudio.playSuccess();
      } else {
        lizardSpeechBubble.classList.add('hidden');
        MysticAudio.playClick();
      }

      clearTimeout(lizardSpeechTimeout);
      lizardSpeechTimeout = setTimeout(() => {
        lizardSpeechBubble.classList.add('hidden');
      }, 6000);
    });
  }

  // Floating Tarot Card Particles in Lobby
  function spawnLobbyCard() {
    const container = document.getElementById('lobby-card-particles');
    const lobby = document.getElementById('main') || document.getElementById('sec-lobby');
    // Only spawn when lobby is active
    if (!container || !lobby || lobby.classList.contains('hidden')) return;

    const card = document.createElement('div');
    card.className = 'floating-card-particle';

    // Random horizontal position across screen (clamped to avoid horizontal overflow)
    const startX = Math.random() * Math.max(20, window.innerWidth - 75);
    card.style.left = `${startX}px`;

    // Random drift and rotation
    const driftX = (Math.random() * 240 - 120) + 'px';
    const rotateDeg = (Math.random() * 120 - 60) + 'deg';
    card.style.setProperty('--drift-x', driftX);
    card.style.setProperty('--rotate-deg', rotateDeg);

    // Random scale between 0.6 and 1.1 for depth effect
    const scale = Math.random() * 0.5 + 0.6;
    card.style.transform = `scale(${scale})`;

    // Randomize speed slightly by setting custom animation duration
    const duration = (Math.random() * 3 + 7.5) + 's'; // 7.5s to 10.5s
    card.style.animationDuration = duration;

    container.appendChild(card);

    // Remove element after animation ends
    setTimeout(() => {
      card.remove();
    }, 11000);
  }

  // Spawn cards every 2.4 seconds
  setInterval(spawnLobbyCard, 2400);
  // Spawn a couple initially
  for (let i = 0; i < 3; i++) {
    setTimeout(spawnLobbyCard, i * 800);
  }

  // Autoplay Background Music
  const startBgm = () => {
    MysticAudio.init();
    if (!MysticAudio.isBgPlaying) {
      const isPlaying = MysticAudio.toggleBackgroundMusic();
      updateAudioButtonUI(isPlaying);
    }
  };

  // Try to play immediately on load (usually blocked by modern browsers)
  setTimeout(() => {
    MysticAudio.init(); // Initialize context and bgAudio
    if (MysticAudio.bgAudio) {
      MysticAudio.bgAudio.play().then(() => {
        MysticAudio.isBgPlaying = true;
        updateAudioButtonUI(true);
      }).catch(() => {
        // Autoplay blocked. Setup one-time trigger on first click or touch anywhere on page.
        const startOnInteraction = (e) => {
          if (e && e.target && e.target.closest('#audio-toggle-btn')) return;
          
          startBgm();
          // Clean up event listeners
          window.removeEventListener('click', startOnInteraction);
          window.removeEventListener('touchstart', startOnInteraction);
        };
        window.addEventListener('click', startOnInteraction, { passive: true });
        window.addEventListener('touchstart', startOnInteraction, { passive: true });
      });
    }
  }, 500);

  // ==========================================================================
  // EX-PARTNER FORTUNE-TELLING LOGIC (ถ่านไฟเก่า & มูฟออน)
  // ==========================================================================
  
  // 1. Rekindle triggers
  const btnStartRekindle = document.getElementById('btn-start-rekindle');
  if (btnStartRekindle) {
    btnStartRekindle.addEventListener('click', () => {
      document.getElementById('rekindle-result-box').classList.add('hidden');
      showSection('sec-rekindle');
    });
  }

  const btnSubmitRekindle = document.getElementById('btn-submit-rekindle');
  if (btnSubmitRekindle) {
    btnSubmitRekindle.addEventListener('click', () => {
      const day1 = document.getElementById('select-rekindle-day1').value;
      const day2 = document.getElementById('select-rekindle-day2').value;
      
      let percent = 50;
      let text = '';
      
      // Calculate a pseudo-random yet deterministic value based on charCodes
      const dayScore = (day1.charCodeAt(3) + day2.charCodeAt(3)) % 10;
      percent = 20 + dayScore * 8; // 20% to 100%
      
      if (AppState.soloCategory === 'serious') {
        // Serious/Astrology tone
        text = `[วิเคราะห์ตามรากพลังดาวเกณฑ์คู่ธาตุ]
คุณเกิด${day1} และแฟนเก่าเกิด${day2} การจรของดาวอริผ่านจุดเชื่อมดาวราหู ส่งผลให้กระแสจิตเดิมยังเหนี่ยวรั้งกันในระดับความถี่ ${percent}% เกณฑ์ชะตาระบุว่าพลังคู่แทรกยังไม่ตัดขาดสนิท มีโอกาสลมพัดหวนได้หากข้ามผ่านช่วงดาวพุธพักร์องศาในเดือนถัดไป แนะนำให้สวดมนต์บทกรณียเมตตาสูตรเพื่อปรับระดับพลังงานดวงจิตให้เกื้อหนุนกันในกรรมดีครับ`;
      } else if (AppState.soloCategory === 'inspiration') {
        // Warm/Inspirational tone
        text = `[บันทึกการเยียวยาใจจากแม่หมอแพม]
ดวงพลังความรู้สึกของคุณกับแฟนเก่ามีแรงดึงดูดอยู่ที่ ${percent}% ค่ะ ทุกการพบเจอและจากลามีเหตุผลนำพาเสมอค่ะ ไม่ว่าอดีตไฟจะเคยร้อนแรงแค่ไหน แต่อนาคตดวงชะตาชีวิตของคุณเตรียมที่จะส่องประกายสว่างไสว ขอให้คุณสวมกอดตัวเองให้มากๆ และก้าวเดินต่อไปข้างหน้าอย่างมั่นใจนะคะ แม่หมอเอาใจช่วยเสมอจ้า 💕`;
      } else {
        // Gag/Funny tone (scold to move on!)
        percent = Math.min(percent, 30); // Keep it low
        text = `🚨 [คำเตือนสติฉุกเฉินจากแม่หมอแพม!]
โอกาสลมพัดหวนคืนดีคือ ${percent}% ถ้วนจ้าแม่! ดับสนิทไม่มีเหลือแม้ขี้เถ้าแล้วค่ะกี่โมง! เลิกนอนร้องไห้ เลิกส่องไอจีเขาได้แล้วจ้า วงจรอุบาทว์ที่เธอเจ็บช้ำมาพอยังคะ? แม่หมอสั่งให้เชิดหน้าสวยๆ แล้วมูฟออนไปหาคนใหม่ที่จะหล่อ รวย และดูแลใจเราดีกว่าเดิมร้อยเท่าดีกว่าจ้า! ขืนกลับไปคือปัญญาอ่อนรอบสองเตือนแล้วนะจ๊ะ! 💥`;
      }
      
      document.getElementById('rekindle-result-percent').textContent = `${percent}%`;
      document.getElementById('rekindle-result-text').textContent = text;
      document.getElementById('rekindle-result-box').classList.remove('hidden');
      MysticAudio.playSuccess();
    });
  }

  // 2. MoveOn triggers
  const btnStartMoveon = document.getElementById('btn-start-moveon');
  if (btnStartMoveon) {
    btnStartMoveon.addEventListener('click', () => {
      document.getElementById('moveon-result-box').classList.add('hidden');
      showSection('sec-moveon');
    });
  }

  const btnSubmitMoveon = document.getElementById('btn-submit-moveon');
  if (btnSubmitMoveon) {
    btnSubmitMoveon.addEventListener('click', () => {
      const timeVal = document.getElementById('select-moveon-time').value;
      const behaviorVal = document.getElementById('select-moveon-behavior').value;
      
      let base = 30;
      if (timeVal === '1') base = 15;
      else if (timeVal === '2') base = 40;
      else if (timeVal === '3') base = 70;
      else if (timeVal === '4') base = 90;
      
      let penalty = 20;
      if (behaviorVal === '1') penalty = 40;
      else if (behaviorVal === '2') penalty = 30;
      else if (behaviorVal === '3') penalty = 25;
      else if (behaviorVal === '4') penalty = 10;
      
      let percent = Math.max(5, base - penalty + Math.floor(Math.random() * 10));
      let text = '';
      
      if (AppState.soloCategory === 'serious') {
        // Serious/Astrology tone
        text = `[ประเมินตามองศาพลังจันทร์เสี้ยว]
ดัชนีเกราะคุ้มกันใจ (Move-On Shield) อยู่ที่ ${percent}% จิตใต้สำนึกของคุณยังคงได้รับแรงสั่นสะเทือนจากดาวจันทร์เดิมที่สถิตในภพมรณะ ทำให้จิตวิญญาณมีอาการโหยหาอดีตซ้ำๆ โหราศาสตร์แนะนำให้คุณสวดถอนสัมผัสพลังงานเชิงลบ และหลีกเลี่ยงการสืบค้นความเคลื่อนไหวใดๆ ของเขาเพื่อช่วยตัดวงโคจรพลังหม่นหมองในเรือนชีวิตให้ฟื้นคืนกลับมาเต็มร้อยโดยเร็วครับ`;
      } else if (AppState.soloCategory === 'inspiration') {
        // Warm/Inspirational tone
        text = `[พลังกอดเพื่อการเริ่มต้นใหม่]
      เกราะป้องกันใจของคุณมีความแข็งแกร่งระดับ ${percent}% แล้วนะคะ เก่งมากๆ เลยค่ะ การเยียวยาใจอาจต้องใช้เวลาและไม่มีใครมูฟออนได้ในวันเดียวอย่างสมบูรณ์หรอกค่ะ โอบกอดความเหงาความเจ็บปวดในวันนี้ไว้ แล้วค่อยๆ เดินต่อทีละก้าว ท้องฟ้าที่สดใสกำลังเตรียมกอดคุณอยู่ข้างหน้านะคะคุณคนเก่ง 💖`;
      } else {
        // Gag/Funny tone (scold to move on!)
        percent = Math.min(percent, 10); // Keep it extremely low
        text = `💥 [ตื่นกี่โมงจ๊ะ! โดนดึงสติด่วนจ้าวัยรุ่น!]
ดัชนีเกราะคุ้มกันใจบางเบาระดับใยแมงมุมตากฝนแค่ ${percent}% สภาพแบบนี้คือพร้อมวนกลับไปเป็นสนามอารมณ์และตัวตลกให้เขาหลอกล้อได้ตลอดเวลาจ้า! เลิกดราม่าลงสตอรี่เรียกร้องความสนใจ เลิกทักไลน์ไปชวนคุยแก้ขัดได้แล้ว! เชิดหน้าหยิ่งๆ ปิดหน้าจอแล้วก้าวเดินไปหาอนาคตที่ปังและรวยๆ กว่าเขาให้มันเสียดายดิ้นพล่านสะใจกว่าเยอะจ้าแม่! 💅`;
      }
      
      document.getElementById('moveon-result-percent').textContent = `${percent}%`;
      document.getElementById('moveon-result-text').textContent = text;
      document.getElementById('moveon-result-box').classList.remove('hidden');
      MysticAudio.playSuccess();
    });
  }

} // closes initializeApp()

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}