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

    let replyText = null;
    let lastError = null;

    const modelsToTry = [
      'gemini-2.0-flash',
      'gemini-3-flash-preview',
      'gemini-1.5-flash'
    ];

    for (const modelName of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
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
          replyText = data.candidates[0].content.parts[0].text;
          break; // Success
        } else {
          lastError = data.error ? (data.error.message || JSON.stringify(data.error)) : JSON.stringify(data);
          console.warn(`Model ${modelName} failed:`, lastError);
        }
      } catch (err) {
        lastError = err.message || err;
        console.warn(`Error calling model ${modelName}:`, lastError);
      }
    }

    if (replyText) {
      return res.status(200).json({ reply: replyText });
    } else {
      return res.status(200).json({ reply: "เพี้ยง! (สัญญานเวทมนตร์ขัดข้อง: " + lastError + ")" });
    }
  } catch (err) {
    console.error("Chat API Error:", err);
    return res.status(200).json({ reply: "โถ่เอ๊ย... พลังจิตของแม่หมอหลุดการเชื่อมต่อชั่วคราว ลองพิมพ์ใหม่อีกรอบนะจ๊ะเด็กๆ 💕" });
  }
}
