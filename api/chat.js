function getSmartPamFallback(userText = '', history = []) {
  const raw = String(userText || '').trim();
  const text = raw.toLowerCase();

  // Math expression check (supports +, -, *, /, ^, %)
  const mathMatch = text.replace(/\s+/g, '').match(/^(-?\d+(?:\.\d+)?)([\+\-\*\/x÷])(-?\d+(?:\.\d+)?)$/);
  if (mathMatch) {
    const num1 = parseFloat(mathMatch[1]);
    const op = mathMatch[2];
    const num2 = parseFloat(mathMatch[3]);
    let result = 0;
    if (op === '+') result = num1 + num2;
    else if (op === '-') result = num1 - num2;
    else if (op === '*' || op === 'x') result = num1 * num2;
    else if (op === '/' || op === '÷') result = num2 !== 0 ? +(num1 / num2).toFixed(4) : 'หาค่าไม่ได้จ้า (หารด้วยศูนย์ไม่ได้นะจ๊ะ)';
    return `🧮 แม่หมอดีดลูกคิดแก้วให้แล้วจ้า! ${num1} ${op} ${num2} = ${result} เป๊ะๆ เลยนะจ๊ะ! ถ้าเอาเลขนี้ไปผสมกับวันเกิดตัวเอง อาจกลายเป็นเลขนำโชคประจำวันนี้ก็ได้น้า ✨`;
  }

  // Dynamic Tarot Deck for contextual synthesis when offline/quota-limited
  const miniTarot = [
    { name: 'The Sun ☀️', vibe: 'แสงสว่าง ความสำเร็จ และข่าวดีที่ชัดเจน', advice: 'กล้าแสดงออกและลุยในสิ่งที่ตั้งใจไว้ได้เลย พลังบวกกำลังหนุนหลังเต็มที่' },
    { name: 'The Star ⭐', vibe: 'ความหวัง การเยียวยา และโอกาสใหม่ที่สดใส', advice: 'ปล่อยวางเรื่องที่ผ่านไปแล้ว เปิดใจรับสิ่งใหม่ที่กำลังเดินทางเข้ามา' },
    { name: 'Wheel of Fortune 🎡', vibe: 'จุดเปลี่ยนสำคัญ โชคชะตาหมุนเวียนไปในทางที่ดีขึ้น', advice: 'เตรียมรับการเปลี่ยนแปลงแบบปุบปับที่จะพาโอกาสดีๆ มาให้' },
    { name: 'The Empress 👑', vibe: 'ความอุดมสมบูรณ์ เสน่ห์เมตตามหานิยม และผู้ใหญ่อุปถัมภ์', advice: 'ดูแลตัวเองให้สดใสพูดจาอ่อนหวาน แล้วทั้งเงินและความรักจะวิ่งเข้าหาเอง' },
    { name: 'The Magician 🪄', vibe: 'ไหวพริบ ความสามารถรอบด้าน และการเริ่มต้นโปรเจกต์ใหม่', advice: 'ใช้ทักษะและคำพูดของตัวเองให้เต็มที่ ช่วงนี้พูดอะไรคนก็คล้อยตาม' },
    { name: 'The Lovers 💘', vibe: 'แรงดึงดูดใจ ความสัมพันธ์ที่ต้องใช้หัวใจตัดสินใจ', advice: 'เปิดอกคุยกันตรงๆ ด้วยความจริงใจ จะช่วยให้ความสัมพันธ์ชัดเจนขึ้นมาก' },
    { name: 'Strength 🦁', vibe: 'ความเข้มแข็งทางใจและการเอาชนะอุปสรรคด้วยความนุ่มนวล', advice: 'ใจเย็นๆ ค่อยๆ แก้ทีละเปาะ ไม่ต้องปะทะตรงๆ แล้วหนูจะเป็นฝ่ายชนะ' },
    { name: 'Ace of Pentacles 🪙', vibe: 'โชคลาภก้อนใหม่ เงินทอง และความมั่นคงที่จับต้องได้', advice: 'มีเกณฑ์ได้ลาภลอยหรือผลตอบแทนจากสิ่งที่ลงแรงไว้ เตรียมกระเป๋ารับทรัพย์ได้เลย' }
  ];

  // Deterministic but varied selection based on message + timestamp seconds
  const hash = Array.from(raw).reduce((acc, ch) => acc + ch.charCodeAt(0), 0) + new Date().getSeconds();
  const drawnCard = miniTarot[hash % miniTarot.length];

  // 1. Lucky outfit colors (สีเสื้อมงคล)
  if (text.includes('สีเสื้อ') || text.includes('สีมงคล') || text.includes('ใส่สีอะไร') || text.includes('แต่งตัวสี')) {
    const dayNames = ['วันอาทิตย์ 🔴', 'วันจันทร์ 🟡', 'วันอังคาร 💗', 'วันพุธ 🟢', 'วันพฤหัสบดี 🟠', 'วันศุกร์ 🔵', 'วันเสาร์ 🟣'];
    const dayColors = [
      'เสริมงานปัง: สีแดง/ชมพู | เรียกทรัพย์: สีเขียว/ทอง | เสน่ห์เมตตา: สีดำ/เทา | เลี่ยง: สีน้ำเงิน',
      'เสริมงานปัง: สีเขียว/ครีม | เรียกทรัพย์: สีม่วง/ส้ม | เสน่ห์เมตตา: สีฟ้า/น้ำเงิน | เลี่ยง: สีแดง',
      'เสริมงานปัง: สีม่วง/ชมพู | เรียกทรัพย์: สีดำ/เทา | เสน่ห์เมตตา: สีแดง | เลี่ยง: สีขาว/เหลือง',
      'เสริมงานปัง: สีเขียว/ส้ม | เรียกทรัพย์: สีเหลือง/ทอง | เสน่ห์เมตตา: สีฟ้า/น้ำเงิน | เลี่ยง: สีชมพู',
      'เสริมงานปัง: สีส้ม/เหลือง | เรียกทรัพย์: สีแดง/ทอง | เสน่ห์เมตตา: สีเขียว | เลี่ยง: สีดำ/ม่วง',
      'เสริมงานปัง: สีฟ้า/น้ำเงิน | เรียกทรัพย์: สีชมพู/แดง | เสน่ห์เมตตา: สีเหลือง/ส้ม | เลี่ยง: สีเทาเข้ม',
      'เสริมงานปัง: สีดำ/เทา | เรียกทรัพย์: สีฟ้า/น้ำเงิน | เสน่ห์เมตตา: สีชมพู/ม่วง | เลี่ยง: สีเขียว'
    ];
    const d = new Date().getDay();
    return `👕 เช็กตารางสีเสื้อมงคลประจำ${dayNames[d]}ให้สดๆ ร้อนๆ เลยจ้า! ✨\n• ${dayColors[d]}\nแม่หมอแอบหยิบไพ่เสริมให้ได้ใบ 【${drawnCard.name}】 แปลว่าวันนี้แต่งตัวมั่นใจๆ แล้วออกไปรับพลังเรื่อง${drawnCard.vibe}ได้เลยนะจ๊ะ! 💖`;
  }

  // 2. Lucky numbers / Lottery (เลขนำโชค / เลขเด็ด / หวย)
  if (text.includes('เลขนำโชค') || text.includes('เลขเด็ด') || text.includes('หวย') || text.includes('ขอเลข') || text.includes('งวดนี้')) {
    const n2 = String((hash * 7 + 19) % 90 + 10);
    const n3 = String((hash * 13 + 271) % 900 + 100);
    return `🍀 เพี้ยง! แม่หมอแพมส่องลูกแก้วคำนวณจากพลังงานไพ่ 【${drawnCard.name}】 ประจำตัวหนูตอนนี้ ได้เลขเด่น 2 ตัวคือ 【 ${n2} 】 และเลข 3 ตัวคือ 【 ${n3} 】 จ้า! เคล็ดลับคือ${drawnCard.advice} ขอให้โชคหล่นทับรับทรัพย์เต็มกระเป๋านะจ๊ะ! 💸✨`;
  }

  // Contextual analysis for open-ended user messages
  return `🔮 แม่หมอแพมอ่านเรื่อง "${raw}" ของหนูแล้ว ลองเปิดไพ่เช็กพลังงานให้ทันที ได้ไพ่ 【${drawnCard.name}】 จ้า! ✨ ไพ่ใบนี้สื่อถึง${drawnCard.vibe} แม่หมอแนะนำว่า${drawnCard.advice}นะจ๊ะ หนูอยากเล่าลงลึกเพิ่มอีกนิดไหมว่าตอนนี้กังวลจุดไหนมากที่สุด เดี๋ยวแม่หมอช่วยเจาะให้เลยจ้า! 💖`;
}

export default async function handler(req, res) {
  // Enable CORS so local Vite dev and preview domains can also use the live Gemini API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;

    const todayStr = new Date().toLocaleDateString('th-TH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const systemInstruction = `คุณคือ "แม่หมอแพม" หมอดูสาวสวยอารมณ์ดี ฉลาดหลักแหลม ขี้เล่น กวนนิดๆ และอบอุ่นเหมือนพี่สาวคนสนิท ประจำเว็บดูดวง "ดวงปังพลังแพม" (มีผู้ช่วยคู่ใจคือ "พี่หมูแด็บ")
ข้อมูลเวลาปัจจุบัน: วันนี้คือ ${todayStr}

หลักการสำคัญในการตอบ (ห้ามตอบแบบแพตเทิร์นสำเร็จรูปเด็ดขาด):
1. อ่านและวิเคราะห์สิ่งที่ผู้ใช้พิมพ์มาจริงๆ ทุกคำ ตอบให้ตรงประเด็นเฉพาะเจาะจงกับเรื่องที่เขาถามหรือเล่ามา (เช่น ถ้าเขาเล่าเรื่องแฟน เรื่องงาน เรื่องเรียน คำนวณเลข ถามความรู้รอบตัว หรือปรึกษาชีวิต ให้เจาะจงไปที่เนื้อหานั้นเลย ไม่พูดกว้างๆ แบบก๊อปวาง)
2. หากเป็นเรื่องดวง ความรัก การงาน การเงิน หรือความกังวลใจ ให้ผสมผสานมุมมองโหราศาสตร์/ไพ่ทาโรต์/ดวงดาวอย่างเป็นธรรมชาติ พร้อมให้คำแนะนำที่นำไปใช้ได้จริงและฮีลใจสุดๆ
3. หากเป็นคำถามทั่วไป ความรู้รอบตัว คณิตศาสตร์ หรือชวนคุยเล่น ให้ตอบอย่างฉลาด แม่นยำ และสอดแทรกมุกขี้เล่นสไตล์แม่หมอแพม
4. ใช้ภาษาไทยที่เป็นธรรมชาติ อบอุ่น ฟีลเพื่อนสนิท/พี่สาวสายมู ลงท้ายด้วยคำน่ารักๆ เช่น "จ้า", "นะจ๊ะ", "เลยน้า" ตามบริบท (ความยาวกระชับพอดี 3-5 ประโยค อ่านง่ายในแชท)
5. จำบริบทบทสนทนาก่อนหน้า (history) และคุยต่อเนื่องอย่างลื่นไหลเหมือนคุยกับคนจริงๆ`;

    // Construct request contents array including recent history for context
    const contents = [];
    if (history && Array.isArray(history)) {
      const historyCtx = history.slice(0, -1);
      historyCtx.slice(-10).forEach(h => {
        if (h && h.text) {
          contents.push({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: String(h.text) }]
          });
        }
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: String(message || 'สวัสดี') }]
    });

    let replyText = null;

    if (apiKey) {
      const modelsToTry = [
        'gemini-3-flash-preview',
        'gemini-2.5-flash',
        'gemini-2.5-flash-lite',
        'gemini-2.0-flash',
        'gemini-1.5-flash'
      ];

      for (const modelName of modelsToTry) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              systemInstruction: {
                parts: [{ text: systemInstruction }]
              },
              generationConfig: {
                temperature: 0.85,
                maxOutputTokens: 1200
              }
            })
          });

          const data = await response.json();
          if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            replyText = data.candidates[0].content.parts[0].text.trim();
            break;
          }
        } catch (err) {
          console.warn(`Error calling model ${modelName}:`, err.message || err);
        }
      }
    }

    return res.status(200).json({
      reply: replyText || getSmartPamFallback(message)
    });
  } catch (err) {
    console.error('Chat API Error:', err);
    return res.status(200).json({
      reply: getSmartPamFallback(req.body?.message)
    });
  }
}

