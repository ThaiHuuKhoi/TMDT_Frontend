import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export interface AISuggestion {
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  originalPrice?: number;
  attributes: { name: string; values: string }[];
}

const PROMPT = `Bạn là trợ lý AI cho website thương mại điện tử bán quần áo thời trang Việt Nam.
Hãy phân tích hình ảnh sản phẩm quần áo này và trả về thông tin sản phẩm bằng tiếng Việt.

Trả về JSON với đúng format sau (không có text thêm, không có markdown):
{
  "name": "Tên sản phẩm ngắn gọn, hấp dẫn",
  "shortDescription": "Một câu mô tả ngắn nổi bật điểm bán hàng",
  "description": "Mô tả chi tiết 2-3 câu về kiểu dáng, chất liệu, đối tượng phù hợp, cách phối đồ",
  "price": 299000,
  "originalPrice": 399000,
  "attributes": [
    { "name": "Màu sắc", "values": "màu 1, màu 2, màu 3" },
    { "name": "Size", "values": "S, M, L, XL, XXL" }
  ]
}

Lưu ý:
- price: giá bán đề xuất theo thị trường Việt Nam (VNĐ, số nguyên, không có dấu chấm/phẩy)
- originalPrice: giá niêm yết gốc cao hơn price 20-40% để tạo cảm giác giảm giá
- Màu sắc: suy luận từ ảnh, liệt kê 3-5 màu phổ biến cho loại sản phẩm này
- Size: dùng chuẩn S, M, L, XL, XXL; thêm XS nếu là đồ nữ nhỏ
- Chỉ trả về JSON thuần, không bọc trong code block`;

export async function POST(request: Request) {
  const { imageUrl } = (await request.json()) as { imageUrl?: string };

  if (!imageUrl) {
    return NextResponse.json({ message: "Thiếu imageUrl" }, { status: 400 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { message: "GEMINI_API_KEY chưa được cấu hình" },
      { status: 500 }
    );
  }

  const imageRes = await fetch(imageUrl);
  if (!imageRes.ok) {
    return NextResponse.json({ message: "Không tải được ảnh" }, { status: 400 });
  }
  const imageBuffer = await imageRes.arrayBuffer();
  const base64 = Buffer.from(imageBuffer).toString("base64");
  const mimeType = (imageRes.headers.get("content-type") || "image/jpeg") as
    | "image/jpeg"
    | "image/png"
    | "image/webp";

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      { inlineData: { mimeType, data: base64 } },
      { text: PROMPT },
    ],
  });

  const raw = result.text?.trim() ?? "";

  let suggestion: AISuggestion;
  try {
    suggestion = JSON.parse(raw) as AISuggestion;
  } catch {
    const stripped = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    suggestion = JSON.parse(stripped) as AISuggestion;
  }

  return NextResponse.json(suggestion);
}
