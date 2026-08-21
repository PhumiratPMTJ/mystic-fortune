// Mystic Games Logic: Extended Astro Tools and Wheel of Fortune
import { 
  COMPATIBILITY_DATABASE, 
  ZODIAC_SIGNS, 
  BIRTHDAYS_COMPAT, 
  NUMBER_COMBINATIONS 
} from './fortuneData.js';
import MysticAudio from './audio.js';

// 1. Compatibility Calculator (Deterministic Hash based on Names and Birthdays)
export function calculateCompatibility(name1, name2, bday1, bday2) {
  const combinedStr = `${name1.trim().toLowerCase()}-${name2.trim().toLowerCase()}-${bday1}-${bday2}`;
  
  let hash = 0;
  for (let i = 0; i < combinedStr.length; i++) {
    hash = (hash << 5) - hash + combinedStr.charCodeAt(i);
    hash |= 0;
  }
  
  const score = Math.abs(hash % 101);
  const dbMatch = COMPATIBILITY_DATABASE.find(item => score >= item.min && score <= item.max) 
               || COMPATIBILITY_DATABASE[COMPATIBILITY_DATABASE.length - 1];
               
  return {
    score,
    title: dbMatch.title,
    description: dbMatch.description
  };
}

// 2. Wheel of Fortune Class (Canvas-based)
export class GameWheel {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.options = [];
    this.angle = 0;
    this.isSpinning = false;
    this.colors = ['#8e2de2', '#ff416c', '#11998e', '#f857a6', '#12c2e9', '#ff5858', '#38ef7d', '#ffd700'];
    
    this.resize();

    // Automatically redraw and scale canvas when window resizes or phone rotates
    window.addEventListener('resize', () => {
      this.resize();
      this.draw();
    });
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const size = Math.min(rect.width, 350);
    this.canvas.width = size * window.devicePixelRatio;
    this.canvas.height = size * window.devicePixelRatio;
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  setOptions(options) {
    this.options = options.length > 0 ? options : ['ไม่มีผู้เล่น'];
    this.draw();
  }

  draw() {
    if (!this.canvas) return;
    const size = this.canvas.width / window.devicePixelRatio;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 15;
    
    this.ctx.clearRect(0, 0, size, size);
    const sliceAngle = (Math.PI * 2) / this.options.length;
    
    // Draw outer glowing rim
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = '#8e2de2';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
    this.ctx.strokeStyle = '#ffd700';
    this.ctx.lineWidth = 4;
    this.ctx.stroke();
    
    this.ctx.shadowBlur = 0;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    this.options.forEach((opt, idx) => {
      const startAngle = this.angle + idx * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy);
      this.ctx.arc(cx, cy, r, startAngle, endAngle);
      this.ctx.fillStyle = this.colors[idx % this.colors.length];
      this.ctx.fill();
      
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();
      
      this.ctx.save();
      this.ctx.translate(cx, cy);
      this.ctx.rotate(startAngle + sliceAngle / 2);
      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'middle';
      this.ctx.font = 'bold 13px "Mitr", "Kanit", sans-serif';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
      this.ctx.shadowBlur = 4;
      
      let text = opt;
      if (text.length > 8) text = text.substring(0, 7) + '...';
      this.ctx.fillText(text, r - 20, 0);
      this.ctx.restore();
    });

    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = '#00ffff';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 25, 0, Math.PI * 2);
    const goldGrad = this.ctx.createRadialGradient(cx, cy, 5, cx, cy, 25);
    goldGrad.addColorStop(0, '#fff');
    goldGrad.addColorStop(0.3, '#ffd700');
    goldGrad.addColorStop(1, '#b8860b');
    this.ctx.fillStyle = goldGrad;
    this.ctx.fill();
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;
    
    this.ctx.beginPath();
    this.ctx.moveTo(cx - 12, 5);
    this.ctx.lineTo(cx + 12, 5);
    this.ctx.lineTo(cx, 22);
    this.ctx.closePath();
    this.ctx.fillStyle = '#ffd700';
    this.ctx.shadowColor = 'rgba(255,215,0,0.8)';
    this.ctx.shadowBlur = 8;
    this.ctx.fill();
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;
  }

  spin(onComplete) {
    if (this.isSpinning) return;
    this.isSpinning = true;
    
    let velocity = Math.random() * 0.4 + 0.35;
    const friction = 0.982;
    const sliceAngle = (Math.PI * 2) / this.options.length;
    let lastTickAngle = this.angle;
    
    const animateSpin = () => {
      this.angle += velocity;
      velocity *= friction;
      
      const deltaAngle = this.angle - lastTickAngle;
      if (deltaAngle >= sliceAngle) {
        const speedRatio = Math.min(velocity / 0.4, 1.0);
        MysticAudio.playSpinTick(speedRatio);
        lastTickAngle = this.angle - (deltaAngle % sliceAngle);
      }
      
      this.draw();
      
      if (velocity > 0.002) {
        requestAnimationFrame(animateSpin);
      } else {
        this.isSpinning = false;
        const normalizedAngle = (Math.PI * 2 - (this.angle % (Math.PI * 2))) % (Math.PI * 2);
        const pointerAngle = (normalizedAngle + Math.PI * 1.5) % (Math.PI * 2);
        const index = Math.floor(pointerAngle / sliceAngle);
        const selected = this.options[index];
        
        MysticAudio.playSuccess();
        if (typeof onComplete === 'function') {
          onComplete(selected, index);
        }
      }
    };
    
    animateSpin();
  }
}

// ==========================================================================
// MYHORA-STYLE ASTROLOGY CALCULATIONS
// ==========================================================================

// 3. Numeric Fortune Analyzer (วิเคราะห์เบอร์โทรศัพท์/เลขทะเบียน)
export function analyzeNumbers(numStr, type = 'mobile') {
  // Filter only digits
  const cleanStr = numStr.replace(/\D/g, '');
  if (cleanStr.length < 2) {
    return { error: 'กรุณากรอกตัวเลขอย่างน้อย 2 หลักขึ้นไปครับ' };
  }

  // Calculate sum of digits
  let sum = 0;
  for (let char of cleanStr) {
    sum += parseInt(char, 10);
  }

  // Extract adjacent pairs
  const pairs = [];
  for (let i = 0; i < cleanStr.length - 1; i++) {
    pairs.push(cleanStr.substring(i, i + 2));
  }

  // Analyze pairs
  const goodPairsMatched = [];
  const badPairsMatched = [];

  const seenGood = new Set();
  const seenBad = new Set();

  pairs.forEach(pair => {
    // Check both standard pair and reversed pair (numerology reads bi-directionally)
    const revPair = pair.split('').reverse().join('');
    
    if (NUMBER_COMBINATIONS.good[pair]) {
      if (!seenGood.has(pair)) {
        seenGood.add(pair);
        goodPairsMatched.push({ pair, meaning: NUMBER_COMBINATIONS.good[pair] });
      }
    } else if (NUMBER_COMBINATIONS.good[revPair]) {
      if (!seenGood.has(pair)) {
        seenGood.add(pair);
        goodPairsMatched.push({ pair, meaning: NUMBER_COMBINATIONS.good[revPair] });
      }
    }

    if (NUMBER_COMBINATIONS.bad[pair]) {
      if (!seenBad.has(pair)) {
        seenBad.add(pair);
        badPairsMatched.push({ pair, meaning: NUMBER_COMBINATIONS.bad[pair] });
      }
    } else if (NUMBER_COMBINATIONS.bad[revPair]) {
      if (!seenBad.has(pair)) {
        seenBad.add(pair);
        badPairsMatched.push({ pair, meaning: NUMBER_COMBINATIONS.bad[revPair] });
      }
    }
  });

  // Calculate grade score based on sum and pair counts
  let baseScore = 65; // start at C+
  baseScore += (goodPairsMatched.length * 8);
  baseScore -= (badPairsMatched.length * 10);
  
  // Constrain to 10-100
  let finalScore = Math.max(10, Math.min(100, baseScore));
  
  // Grade
  let grade = 'F';
  if (finalScore >= 95) grade = 'A+';
  else if (finalScore >= 85) grade = 'A';
  else if (finalScore >= 75) grade = 'B+';
  else if (finalScore >= 65) grade = 'B';
  else if (finalScore >= 55) grade = 'C+';
  else if (finalScore >= 45) grade = 'C';
  else if (finalScore >= 35) grade = 'D+';
  else if (finalScore >= 25) grade = 'D';

  // Make reading text based on sum and grade
  let summaryText = '';
  if (grade.startsWith('A')) {
    summaryText = `ตัวเลขผลรวม ${sum} นี้มีผลพลังงานที่เป็นมงคลอย่างมาก คลื่นความถี่ตัวเลขช่วยเกื้อหนุนดวงชะตาของผู้ใช้ให้เปิดช่องทางมหาเศรษฐี การติดต่อสื่อสารเจรจาราบรื่น และได้รับการสนับสนุนจากผู้หลักผู้ใหญ่อยู่ตลอดเวลา`;
  } else if (grade.startsWith('B')) {
    summaryText = `ตัวเลขผลรวม ${sum} จัดอยู่ในเกณฑ์ที่ดีปานกลาง สามารถประคับประคองชีวิตประจำวันได้อย่างราบรื่น มีโชคการเงินสะพัดเรื่อยๆ แต่อาจต้องเหนื่อยยากใช้แรงผลักดันตนเองเป็นหลักในการลงมือทำ`;
  } else if (grade.startsWith('C')) {
    summaryText = `ตัวเลขผลรวม ${sum} ให้พลังงานทรงตัว มีทั้งคุณและโทษผสมปนเปกันไป มีบางคู่ตัวเลขที่ต้องระวังในการขัดแย้งเกี่ยวกับคำพูดการเจรจา ควรปรับการครองสติอยู่เสมอเวลาใช้งานตัวเลขชุดนี้`;
  } else {
    summaryText = `ตัวเลขผลรวม ${sum} มีคลื่นความถี่ค่อนข้างอันตรายหรือสร้างความเครียดสูง มีคู่ตัวเลขขัดแย้ง (เช่น อุปสรรค, อุบัติเหตุ หรือรายจ่ายรั่วไหล) ควรหลีกเลี่ยงการใช้งานเป็นเวลานาน หรือหาเลขมงคลคู่มิตรมาเปลี่ยนแก้เคล็ดด่วนครับ`;
  }

  return {
    sum,
    score: finalScore,
    grade,
    summary: summaryText,
    goodPairs: goodPairsMatched,
    badPairs: badPairsMatched
  };
}

// 4. Zodiac & Birthday Compatibility Matcher (ดูดวงสมพงษ์แบบ MyHora 100%)
export function calculateZodiacMatch(zodiacName1, zodiacName2, day1, day2) {
  const z1 = ZODIAC_SIGNS.find(z => z.sign === zodiacName1) || ZODIAC_SIGNS[0];
  const z2 = ZODIAC_SIGNS.find(z => z.sign === zodiacName2) || ZODIAC_SIGNS[0];
  
  // Elements Compatibility Matrix
  const elem1 = z1.element;
  const elem2 = z2.element;
  
  let elementScore = 50; // default medium
  let elementComment = '';
  
  if (elem1 === elem2) {
    if (elem1 === 'ไฟ') {
      elementScore = 65;
      elementComment = 'ธาตุไฟกับธาตุไฟ: พลังงานรักล้นลาม ทรงพลัง แต่ต้องระวังหัวร้อนใส่กันบ่อยครั้งดั่งภูเขาไฟประจัญหน้า';
    } else if (elem1 === 'น้ำ') {
      elementScore = 85;
      elementComment = 'ธาตุน้ำกับธาตุน้ำ: เข้าอกเข้าใจกันอย่างลึกซึ้ง ไหลรวมเข้ากันได้ดีเยือกเย็นและอบอุ่นใจไร้รอยต่อ';
    } else if (elem1 === 'ดิน') {
      elementScore = 80;
      elementComment = 'ธาตุดินกับธาตุดิน: หนุนนำความมั่นคง มั่งคั่ง ค้าขายร่วมกันขึ้นดีมาก แต่อาจเรียบง่ายจนน่าเบื่อในบางจังหวะ';
    } else {
      elementScore = 70;
      elementComment = 'ธาตุลมกับธาตุลม: ความคิดสร้างสรรค์ลื่นไหล คุยกันสนุกสนาน แต่อาจจับจด รักอิสระจนห่างเหินกันได้ง่าย';
    }
  } else {
    // Inter-element compatibility
    const key = `${elem1}-${elem2}`;
    const reverseKey = `${elem2}-${elem1}`;
    
    if (key === 'ไฟ-ลม' || reverseKey === 'ไฟ-ลม') {
      elementScore = 90;
      elementComment = 'ธาตุไฟกับธาตุลม: คู่เกื้อกูลยอดเยี่ยม! ลมช่วยกระพือไฟให้โชติช่วง พากันร่ำรวยและส่งเสริมเป้าหมายชีวิตได้ไว';
    } else if (key === 'ดิน-น้ำ' || reverseKey === 'ดิน-น้ำ') {
      elementScore = 95;
      elementComment = 'ธาตุดินกับธาตุน้ำ: คู่แท้กิ่งทองใบยหก! น้ำหล่อเลี้ยงดินให้อุดมสมบูรณ์ ปลูกอะไรก็ผลิบาน รักมั่นคงยืนยาว';
    } else if (key === 'น้ำ-ไฟ' || reverseKey === 'น้ำ-ไฟ') {
      elementScore = 30;
      elementComment = 'ธาตุน้ำกับธาตุไฟ: คู่ทำลายขัดแย้ง! คุยกันไม่พ้นสี่คำก็ปะทะฉับพลัน น้ำคอยดับไฟกระจุย ไฟทำให้น้ำเดือดพล่าน รักษาระยะห่างแก้เคล็ดด่วน';
    } else if (key === 'ดิน-ไฟ' || reverseKey === 'ดิน-ไฟ') {
      elementScore = 75;
      elementComment = 'ธาตุดินกับธาตุไฟ: คู่อบอุ่นสร้างฐานะ! ไฟให้ความร้อนและแร่ธาตุแก่ดิน ดินช่วยประคองไฟให้มั่นคงพึ่งพาได้';
    } else if (key === 'ดิน-ลม' || reverseKey === 'ดิน-ลม') {
      elementScore = 45;
      elementComment = 'ธาตุดินกับธาตุลม: คู่ทรงตัวเฉยๆ! ดินไม่ขยับตามลม ลมพัดดินให้ฝุ่นตลบปวดขมับ ปรับตัวหาความสมดุลหนักหน่อย';
    } else if (key === 'น้ำ-ลม' || reverseKey === 'น้ำ-ลม') {
      elementScore = 60;
      elementComment = 'ธาตุน้ำกับธาตุลม: คู่คลื่นลมแปรปรวน! ลมพัดน้ำเกิดคลื่นลมแรง รักแปรปรวนตามอารมณ์ บางวันดีใจหาย บางวันเย็นชาเฉียบกริบ';
    }
  }

  // Birthdays matching logic
  let dayScoreOffset = 0;
  let dayComment = 'ดวงความสัมพันธ์วันเกิดทั่วไป หนุนนำราบรื่นดี';
  
  if (day1 && day2 && BIRTHDAYS_COMPAT[day1]) {
    const compat = BIRTHDAYS_COMPAT[day1];
    if (compat.match.includes(day2)) {
      dayScoreOffset = 10;
      dayComment = `วันเกิดคู่อัครมิตรส่งเสริมมงคลดวงเจ้าเรือน (${day1} เกื้อหนุน ${day2}) มีเกณฑ์คอยอุ้มชูนำโชคดีมาให้กันเสมอ`;
    } else if (compat.clash.includes(day2)) {
      dayScoreOffset = -15;
      dayComment = `วันเกิดคู่อริธาตุขัดแย้งอารมณ์สะสะสม (${day1} ปะทะ ${day2}) ต้องใช้ความใจเย็นและความอดทนสูงมากเวลาปรึกษากัน`;
    }
  }

  const finalScore = Math.max(10, Math.min(100, elementScore + dayScoreOffset));

  return {
    score: finalScore,
    elemMatch: elementComment,
    dayMatch: dayComment,
    sign1: z1.name,
    sign2: z2.name
  };
}

// 5. Zodiac Sign and Element Calculator (ดูดวงราศีและธาตุตามวัน/เดือนเกิด)
export function getZodiacAndElement(day, monthNum) {
  // Day: 1-31, monthNum: 1-12 (Jan-Dec)
  const d = parseInt(day, 10);
  const m = parseInt(monthNum, 10);
  
  let signMatch = ZODIAC_SIGNS[0]; // fallback to Aries
  
  // Decide sign based on Thai astrology ranges (approx. 13th to 16th of each month)
  if ((m === 4 && d >= 13) || (m === 5 && d <= 13)) signMatch = ZODIAC_SIGNS[0]; // Aries (เมษ)
  else if ((m === 5 && d >= 14) || (m === 6 && d <= 13)) signMatch = ZODIAC_SIGNS[1]; // Taurus (พฤษภ)
  else if ((m === 6 && d >= 14) || (m === 7 && d <= 14)) signMatch = ZODIAC_SIGNS[2]; // Gemini (เมถุน)
  else if ((m === 7 && d >= 15) || (m === 8 && d <= 15)) signMatch = ZODIAC_SIGNS[3]; // Cancer (กรกฎ)
  else if ((m === 8 && d >= 16) || (m === 9 && d <= 16)) signMatch = ZODIAC_SIGNS[4]; // Leo (สิงห์)
  else if ((m === 9 && d >= 17) || (m === 10 && d <= 16)) signMatch = ZODIAC_SIGNS[5]; // Virgo (กันย์)
  else if ((m === 10 && d >= 17) || (m === 11 && d <= 15)) signMatch = ZODIAC_SIGNS[6]; // Libra (ตุลย์)
  else if ((m === 11 && d >= 16) || (m === 12 && d <= 15)) signMatch = ZODIAC_SIGNS[7]; // Scorpio (พิจิก)
  else if ((m === 12 && d >= 16) || (m === 1 && d <= 14)) signMatch = ZODIAC_SIGNS[8]; // Sagittarius (ธนู)
  else if ((m === 1 && d >= 15) || (m === 2 && d <= 12)) signMatch = ZODIAC_SIGNS[9]; // Capricorn (มังกร)
  else if ((m === 2 && d >= 13) || (m === 3 && d <= 13)) signMatch = ZODIAC_SIGNS[10]; // Aquarius (กุมภ์)
  else if ((m === 3 && d >= 14) || (m === 4 && d <= 12)) signMatch = ZODIAC_SIGNS[11]; // Pisces (มีน)

  // Generate dynamic daily forecast text based on element and date
  const elementForecasts = {
    "ไฟ": "วันนี้พลังธาตุไฟลุกโชนเด่นชัด การงานลื่นไหล รวดเร็วปานกามเทพแผลงศร แต่ระวังอารมณ์ร้อนเดือดปุดๆ ในเรื่องไม่เป็นเรื่อง การเงินสะพัดดีมีเกณฑ์ได้ลาภลอย",
    "ดิน": "ช่วงนี้ธาตุดินมั่นคงสมบูรณ์ การเงินนิ่งสนิทเหมาะแก่การประหยัดออมและลงทุนยาวๆ สุขภาพร่างแข็งแรงดี ความรักเรียบง่ายแต่อบอุ่นเข้าใจกันเป็นอย่างดี",
    "ลม": "วันนี้พลังธาตุลมเคลื่อนไหวสร้างสรรค์เด่นล้ำ มีโชคเรื่องเจรจาติดต่อค้าขายผลงานใหม่ๆ สำเร็จงดงาม ความรักระวังการเข้าใจผิดจากความโลเลคิดเยอะ",
    "น้ำ": "ธาตุน้ำหล่อเลี้ยงจิตใจเย็นฉ่ำในวันนี้ เซนส์สัญชาตญาณแม่นยำสูงมีสติปัญญาแจ่มใส ปัญหาขัดข้องใจจะได้รับการคลี่คลายด้วยดีจากกัลยาณมิตร"
  };

  return {
    name: signMatch.name,
    sign: signMatch.sign,
    element: signMatch.element,
    color: signMatch.color,
    number: signMatch.number,
    trait: signMatch.trait,
    forecast: elementForecasts[signMatch.element]
  };
}
