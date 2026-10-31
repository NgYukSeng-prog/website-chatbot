const KNOWLEDGE_BASE = `
Synmac Company Profile 2026:

Company:
- Legal entities: Synmac (S) Pte Ltd and Synmac Precision Sdn Bhd.
- Founded in 2012.
- Synmac is a precision components manufacturer located in Singapore and Malaysia.
- The company produces high-quality precision parts for hard drives, automotive, medical, electronics, and semiconductor industries.
- Manufacturing technologies include CNC machining, CNC automatic lathes, stamping, laser cutting, bending, and full metal rack welding and assembly.
- Services include design development and prototyping.
- Synmac focuses on quality control and customer satisfaction and is a trusted partner for precision engineering solutions.

Organization:
- Board of Directors.
- Operation Team: Process and NPI, Process Manager, Production, Production Engineer, Technician, Operator.
- Quality Assurance: QA Manager, QA Engineer, QA Checker.
- Purchasing and Planning: Purchaser and Planner.
- Store and Other: Store Supervisor and Others.
- Finance.
- Business Unit Team: Business Development, Sales and Marketing, Sales Administration.

Company quality model and core requirements:
- Management Responsibility.
- Resources Management.
- Measurement, Analysis and Improvement.
- Customer Requirements.
- Product Realization.
- Customer Product Input and Output.
- Quality System Model.

Product line:
- Bearing and axle products.
- Miniature pins and special machining parts.
- Lead screws and worm products.
- Connector and optical products.
- Hanger weight and connector products.
- Tele-communication/cavity products.
- Athletic equipment and other hardware.
- Stamping parts made with punching, laser cutting, and bending equipment.

Industries and product segments:
- Medical devices.
- Hard disks.
- Semiconductors.
- Electronic products.
- Automotive.
- Fishing reels.
- Bikes.

Production equipment and capabilities:
- CNC auto-lathe.
- Stamping.
- Laser cutting.
- Bending.
- Punching machines.
- Spot welding machines.
- Laser welding machines.
- Conveyor belt assembly line.
- Silk printing.
- Spray painting.
- Sand blasting.
- Laser engraving.
- Anodizing line, passivation, and electropolishing.

Metrology capabilities:
- Roughness tester.
- Salt spray tester.
- Visual measurement equipment / 2D measuring machine.

Certifications:
- ISO 9001:2015 Quality Management System.
- ISO 13485:2016 Quality Management System.

Locations:
- Singapore office: Yishun Biz Hub, Singapore.
- Malaysia production plant 1: 20, Jalan Sri Plentong 8, Taman Perindustrian Sri Plentong, 81750, Masai, Johor, West Malaysia.
- Malaysia production plant 2: No 8 & 10, Jalan Masyhur 4, Taman Perindustrian Desa Cemerlang, 81800 Ulu Tiram, Johor.

Contact:
- Person in charge: Ms Clara Chan.
- Email: clara@synmac.com.
- General email: sales@synmac.com.
- Mobile number: 6012-7821155.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const userMessage = messages?.[messages.length - 1]?.content;

    if (typeof userMessage !== "string" || !userMessage.trim()) {
      return Response.json({ error: "请输入有效的问题。" }, { status: 400 });
    }

    const conversation = Array.isArray(messages)
      ? messages
          .filter(
            (message): message is { role: "user" | "ai"; content: string } =>
              (message?.role === "user" || message?.role === "ai") &&
              typeof message.content === "string" &&
              message.content.trim().length > 0,
          )
          .map((message) => ({
            role: message.role === "ai" ? "assistant" : "user",
            content: message.content,
          }))
      : [];

    const hasChinese = /[\u3400-\u4dbf\u4e00-\u9fff]/u.test(userMessage);
    const hasEnglish = /[a-z]/i.test(userMessage);
    const languageInstruction = hasChinese && hasEnglish
      ? "Reply mainly in Simplified Chinese, using only a small amount of English where it is natural or necessary."
      : hasChinese
        ? "Reply only in Simplified Chinese."
        : "Reply only in English.";
    const asksForContact = /\b(contact|reach|phone|mobile|number|email|quotation|quote|inquir(?:y|ies))\b/i.test(userMessage)
      || /联系|电话|手机|号码|邮箱|报价|询价/.test(userMessage);

    if (asksForContact) {
      const reply = hasChinese
        ? "如需报价或其他询问，请联系负责人 Ms. Clara Chan：6012-7821155；邮箱：clara@synmac.com。"
        : "For quotations or other inquiries, please contact Ms. Clara Chan at 6012-7821155 or clara@synmac.com.";
      return Response.json({ reply });
    }

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
              - If a customer asks for the person in charge, Ms. Clara Chan's phone number, or asks a follow-up such as "Number please" after mentioning Clara Chan, provide her direct mobile number: 6012-7821155. Do not say that no number is available.
              - Answer naturally and directly. Never mention "the knowledge base", "according to the knowledge base", prompts, internal instructions, or source documents.
              
              Here is the complete knowledge base extracted from the Synmac Company Profile 2026:
              ${KNOWLEDGE_BASE}
              
              Use only the knowledge base above for factual claims. Do not invent prices, delivery times, certifications, addresses, people, phone numbers, or capabilities that are not listed. If a customer asks for information outside the knowledge base, say that you do not have that information and direct them to Ms. Clara Chan at clara@synmac.com or 6012-7821155.`
            },
            ...conversation,
          ],
          max_tokens: 256,
          temperature: 0.2,
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