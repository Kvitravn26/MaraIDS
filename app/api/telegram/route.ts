import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    let text = "";

    // Payment notification
    if (body.type === "payment" || body.paymentNotification) {
      const { projectTitle, amount, currency, paymentModel, invoiceNumber } = body;
      text = `
💳 **Отримано оплату за проєктом ${projectTitle || "Об'єкт"}!**

💰 **Сума:** ${amount} ${currency || "USD"}
📋 **Рахунок:** ${invoiceNumber || "INV-001"}
⚡ **Модель оплати:** ${paymentModel || "FULL"}
🕒 **Час:** ${new Date().toLocaleString("uk-UA", { timeZone: "Europe/Kyiv" })}
      `.trim();
    } else if (body.customText) {
      text = body.customText;
    } else {
      // Standard lead inquiry
      const { name, contact, propertyType, area, message } = body;
      text = `
🔥 **Новий лід з Mara Design Studio!** 🔥

👤 **Ім'я:** ${name || "Клієнт"}
📞 **Контакт:** ${contact || "—"}
🏢 **Тип:** ${propertyType || "Квартира"}
📐 **Площа:** ${area || "—"} m²

💬 **Повідомлення:**
${message || "—"}
      `.trim();
    }

    if (BOT_TOKEN && CHAT_ID) {
      const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
      const res = await fetch(telegramUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: text,
          parse_mode: "Markdown",
        }),
      });

      if (!res.ok) {
        console.error("Telegram API Error:", await res.text());
      }
    } else {
      console.log("--- TELEGRAM MOCK NOTIFICATION ---");
      console.log(text);
      console.log("-----------------------------------");
    }

    return NextResponse.json({ success: true, delivered: Boolean(BOT_TOKEN && CHAT_ID) });
  } catch (error) {
    console.error("Server error in /api/telegram:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}