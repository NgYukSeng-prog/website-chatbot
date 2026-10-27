// 文件路径: app/api/chat/route.ts
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const userMessage = messages?.[messages.length - 1]?.content;

    if (typeof userMessage !== "string" || !userMessage.trim()) {
      return Response.json({ error: "请输入有效的问题。" }, { status: 400 });
    }

    const hasChinese = /[\u3400-\u4dbf\u4e00-\u9fff]/u.test(userMessage);
    const hasEnglish = /[a-z]/i.test(userMessage);
    const languageInstruction = hasChinese && hasEnglish
      ? "Reply mainly in Simplified Chinese, using only a small amount of English where it is natural or necessary."
      : hasChinese
        ? "Reply only in Simplified Chinese."
        : "Reply only in English.";

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    if (!accountId || !apiToken) {
      throw new Error("Cloudflare environment variables are not configured.");
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.2-1b-instruct`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + apiToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { 
              role: "system", 
              content: `You are a professional and friendly customer service AI for Synmac (S) Pte Ltd and Synmac Precision Sdn Bhd[cite: 3]. 
              IMPORTANT LANGUAGE RULES:
              - You may reply only in English or Simplified Chinese. Never reply in Hindi, Indian languages, Malay, Japanese, Korean, or any other language.
              - Follow this per-message language instruction exactly: ${languageInstruction}
              - Do not switch languages because of the user's device, location, name, or browser settings.
              - Keep company names, email addresses, phone numbers, product names, and technical terms in their original form when appropriate.
              
              Here is your core knowledge base to answer customer questions:
              
              - Company Overview: Founded in 2012, Synmac is a precision components manufacturer located in Singapore and Malaysia[cite: 5].
              - Industries Served: We produce parts for medical devices, hard disks, semiconductors, electronic products, automotive, fishing reels, and bikes[cite: 5, 17].
              - Core Capabilities: We specialize in CNC machining, CNC automatic lathes, stamping, laser cutting, bending, and full metal rack welding and assembly[cite: 5].
              - Additional Services: We offer design development, prototyping, silk printing, spray painting, sand blasting, laser engraving, anodizing, passivation, and electropolishing[cite: 5, 24, 25, 26, 27, 28].
              - Products: Our components include bearing and axle products, miniature pins, lead screws, worm products, connectors, optical products, hanger weights, tele-communication cavities, and athletic hardware[cite: 9, 10, 11, 12, 13, 14, 15].
              - Quality Certifications: We are certified in ISO 9001:2015 and ISO 13485:2016 (Medical Devices Quality Management System)[cite: 30, 31].
              - Locations: Our Singapore office is at Yishun Biz Hub[cite: 32]. Our Malaysia production plants are located in Johor Bahru (Plant 1 in Masai, Plant 2 in Ulu Tiram)[cite: 32].
              - Company Policy: We are committed to high-quality products, competitive pricing, and strict adherence to delivery schedules[cite: 7].
              
              If a customer asks a question outside of this knowledge base, politely state that you do not have that information and direct them to contact Ms. Clara Chan at clara@synmac.com or sales@synmac.com, or call 6012-7821155[cite: 33].` 
            },
            { role: "user", content: userMessage },
          ],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Cloudflare API error: ${response.status}`);
    }

    const result = await response.json();
    const replyText = result?.result?.response;

    if (typeof replyText !== "string" || !replyText.trim()) {
      throw new Error("Cloudflare API returned no reply.");
    }

    return Response.json({ reply: replyText });
  } catch (error) {
    console.error("API route error:", error);
    return Response.json(
      { error: "System error, please try again. 系统连接错误，请稍后重试。" },
      { status: 500 },
    );
  }
}