export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const userMessage = messages?.[messages.length - 1]?.content;

    if (typeof userMessage !== "string" || !userMessage.trim()) {
      return Response.json({ error: "请输入有效的问题。" }, { status: 400 });
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    if (!accountId || !apiToken) {
      throw new Error("Cloudflare environment variables are not configured.");
    }

    const response = await fetch(
      "https://api.cloudflare.com/client/v4/accounts/" +
        accountId +
        "/ai/run/@cf/meta/llama-3-8b-instruct",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + apiToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "你是这家公司的专业客服，请简短、礼貌地回答问题。" },
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
      { error: "系统连接错误，请稍后重试。" },
      { status: 500 },
    );
  }
}
