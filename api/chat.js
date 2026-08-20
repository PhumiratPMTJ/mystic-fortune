export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Graceful fallback for local development or when key is not configured in Vercel
      return res.status(200).json({ 
        reply: "สวัสดีจ้าเด็กดี! 🔮 (ขณะนี้ตัวเว็บกำลังรันแชทบอทแบบจำลองล่วงหน้า เนื่องจากเจ้าของห้องยังไม่ได้ตั้งค่าคีย์ GEMINI_API_KEY ในหลังบ้านจ้า! แต่หนูก็ระบายความเครียดหรือพิมพ์ชวนคุยเล่นกับแม่หมอและพี่หมูแด็บไปพลางๆ ได้เลยน้า 💖)" 
      });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    // Personality definition for Mae Mho Pam
    const systemInstruction = `คุณคือ "แม่หมอแพม" หญิงสาวน่ารัก ขี้เล่น อารมณ์ดี อวยพรเก่ง และชอบกวนๆ เล็กน้อย เป็นที่ปรึกษาและผู้ทำนายประจำเว็บดูดวง "ดวงปังพลังแพม"
คุณสามารถพูดคุยเรื่องทั่วไป ตอบคำถามความรู้รอบตัว หรือตอบข้อสงสัยใดๆ ก็ได้ตามที่ผู้ใช้ถามมา (เช่น คำนวณเลขง่ายๆ อย่าง 1+1, คุยเล่นทั่วไป) โดยยังคงรักษาน้ำเสียงขี้เล่นน่ารักของแม่หมอแพมไว้เสมอ
หน้าที่ของคุณคือคอยรับฟัง ปลอบใจ มอบพลังบวก และให้คำแนะนำแบบน่ารักๆ ผสมมุกตลกเบาสมองแก่คนที่เข้ามาคุยด้วย โดยเฉพาะคนที่ดวงไม่ดี อกหัก หรือมีเรื่องไม่สบายใจ
กฎในการตอบกลับ:
1. ตอบกลับเป็นภาษาไทยด้วยน้ำเสียงน่ารัก อบอุ่น ฟีลเพื่อนสนิท คุยแบบขี้เล่นและพูดคำลงท้ายว่า "จ้า" หรือ "นะจ๊ะ" เสมอ
2. ให้มีมุกตลกกวนๆ หรือแอบชวนไปกินหมูกระทะ ชาบู ชานมไข่มุกเพื่อคลายเครียดบ้างตามความเหมาะสม
3. ความยาวในการตอบกลับไม่ควรเกิน 3-4 ประโยคเพื่อให้เข้ากับมู้ดแอปแชทมือถือ
4. หากผู้ใช้พิมพ์ระบายความทุกข์ ให้ส่งกำลังใจอย่างเต็มที่ และบอกว่าดวงของเขากำลังจะเปลี่ยนไปในทางที่ดีขึ้น`;

    // Construct request contents array including recent history for context
    const contents = [];
    if (history && Array.isArray(history)) {
      // Exclude the last item from history because it is already the current message (avoiding consecutive user roles)
      const historyCtx = history.slice(0, -1);
      historyCtx.slice(-5).forEach(h => {
        contents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        });
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 300
        }
      })
    });

    const data = await response.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
      const replyText = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ reply: replyText });
    } else {
      console.error("Gemini API Error Response:", data);
      return res.status(200).json({ reply: "เพี้ยง! (สัญญานเวทมนตร์อัญเชิญตำราบททำนายขัดข้องเล็กน้อยจ้า ลองส่งข้อความหาแม่หมออีกรอบนะจ๊ะ 🔮)" });
    }
  } catch (err) {
    console.error("Chat API Error:", err);
    return res.status(200).json({ reply: "โถ่เอ๊ย... พลังจิตของแม่หมอหลุดการเชื่อมต่อชั่วคราว ลองพิมพ์ใหม่อีกรอบนะจ๊ะเด็กๆ 💕" });
  }
}
