import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AICompanionData } from "@/types/victory";
import type { PlanetProfile } from "@/types/profile";
import { ROLE_INFO } from "@/types/profile";

// ===================================================================
// 🔧 KHỞI TẠO GEMINI API
// ===================================================================
const API_KEY = (import.meta.env.VITE_GEMINI_API_KEY || "").trim();

let genAI: GoogleGenerativeAI | null = null;

try {
    genAI = new GoogleGenerativeAI(API_KEY);
} catch (error) {
    console.error("Failed to initialize Gemini AI:", error);
}

export interface ChatMessage {
    role: "user" | "model";
    parts: string;
}

// ===================================================================
// 🎯 CHỈNH PROMPT Ở ĐÂY - NƠI QUAN TRỌNG NHẤT!
// ===================================================================
/**
 * Tạo system prompt dựa trên AI companion và profile người chơi
 * 
 * 📌 ĐÂY LÀ NƠI BẠN CHỈNH TÍNH CÁCH VÀ HÀNH VI CỦA AI!
 * 
 * Bạn có thể chỉnh:
 * 1. basePrompt: Tính cách chung của AI (dòng 52-60)
 * 2. rolePrompt: Cách AI phản hồi theo từng role (dòng 64-71)
 * 3. Độ dài câu trả lời: "2-3 sentences max" → có thể đổi thành "4-5 sentences"
 * 4. Ngôn ngữ: "Use Vietnamese language" → có thể đổi thành "English"
 * 5. Emoji usage: "occasionally" → "frequently" hoặc "never"
 */
function generateSystemPrompt(
    ai: AICompanionData,
    planetId: string,
    planetName: string,
    profile?: PlanetProfile | null
): string {
    // 📝 PHẦN 1: PROMPT CHUNG - Tính cách cơ bản của AI
    const basePrompt = `You are ${ai.name}, an AI companion on planet ${planetName} (${planetId}).
Your personality: ${ai.title}
Your avatar: ${ai.avatar}
Your color theme: ${ai.color}

IMPORTANT RULES:
1. Keep responses SHORT (2-3 sentences max) ← CHỈNH ĐỘ DÀI Ở ĐÂY
2. Use emojis occasionally to match your personality ← CHỈNH SỬ DỤNG EMOJI Ở ĐÂY
3. Stay in character as ${ai.name}
4. Focus on ${planetName} facts, geography, science, and exploration
5. Be educational but fun and engaging
6. Use Vietnamese language ← CHỈNH NGÔN NGỮ Ở ĐÂY
`;

    // 📝 PHẦN 2: PROMPT THEO PROFILE - Cá nhân hóa theo role người chơi
    if (profile) {
        const roleInfo = ROLE_INFO[profile.role];
        const rolePrompt = `
You are talking to ${profile.citizenName}, a ${roleInfo.title} (${roleInfo.icon}) on ${planetName}.

Their profile:
- Name: ${profile.citizenName}
- Role: ${roleInfo.title} - ${roleInfo.description}
- Quiz Score: ${profile.quizScore}/5 (${profile.quizTier} tier)
- Badges: ${profile.badges.join(", ")}

PERSONALIZATION: ← CHỈNH CÁCH PHẢN HỒI THEO TỪNG ROLE Ở ĐÂY
- Always address them by name "${profile.citizenName}"
- Tailor responses to their role:
  ${profile.role === "scientist" ? "• Focus on scientific facts, data, research, geological structures" : ""}
  ${profile.role === "explorer" ? "• Focus on adventure, discovery, navigation, hidden locations" : ""}
  ${profile.role === "engineer" ? "• Focus on structures, technology, construction, materials" : ""}
  ${profile.role === "pilot" ? "• Focus on orbital mechanics, navigation, flight paths, coordinates" : ""}
- Acknowledge their achievements (quiz score, badges)
`;

        return basePrompt + rolePrompt;
    }

    return basePrompt;
}

// ===================================================================
// 💬 HÀM GỬI TIN NHẮN - CHỈNH CẤU HÌNH Ở ĐÂY
// ===================================================================
/**
 * Gửi tin nhắn đến Gemini AI và nhận phản hồi
 * 
 * 📌 CẤU HÌNH QUAN TRỌNG (dòng 142-143):
 * - maxOutputTokens: 200 → Số từ tối đa trong câu trả lời (200 ≈ 150 từ)
 * - temperature: 0.7 → Độ sáng tạo (0.0 = rất chính xác, 1.0 = rất sáng tạo)
 * 
 * Muốn AI trả lời dài hơn? → Tăng maxOutputTokens lên 400-500
 * Muốn AI sáng tạo hơn? → Tăng temperature lên 0.9
 * Muốn AI chính xác hơn? → Giảm temperature xuống 0.3-0.5
 */
export async function sendChatMessage(
    planetId: string,
    planetName: string,
    ai: AICompanionData,
    userMessage: string,
    conversationHistory: ChatMessage[] = [],
    profile?: PlanetProfile | null
): Promise<string> {
    if (!genAI) {
        return "Xin lỗi, AI chatbot chưa được cấu hình. Vui lòng thêm VITE_GEMINI_API_KEY vào file .env 🛠️";
    }

    try {
        // ⚙️ MODEL ĐÃ TEST VÀ XÁC NHẬN HOẠT ĐỘNG!
        // Chỉ có "gemini-pro-latest" hoạt động với API key này
        const model = genAI.getGenerativeModel({
            model: "gemini-pro-latest"
        });

        // Build conversation context
        const systemPrompt = generateSystemPrompt(ai, planetId, planetName, profile);

        // Build complete prompt with history
        const conversationText = conversationHistory
            .map((msg) => `${msg.role === "user" ? "Người dùng" : ai.name}: ${msg.parts}`)
            .join("\n");

        const fullPrompt = `${systemPrompt}

${conversationText ? `Lịch sử hội thoại:\n${conversationText}\n` : ""}
Người dùng: ${userMessage}
${ai.name}:`;

        // Generate response
        const result = await model.generateContent(fullPrompt);
        const response = result.response;
        const text = response.text();

        return text || "Xin lỗi, tôi không hiểu câu hỏi. Hãy thử lại nhé! 🤔";
    } catch (error: unknown) {
        console.error("Gemini API error:", error);

        // Handle specific errors
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (errorMessage?.includes("API key")) {
            return "⚠️ API key không hợp lệ. Vui lòng kiểm tra VITE_GEMINI_API_KEY trong file .env";
        }

        if (errorMessage?.includes("quota")) {
            return "⚠️ Đã vượt quá giới hạn API. Vui lòng thử lại sau vài phút! ⏰";
        }

        return `Xin lỗi, có lỗi xảy ra: ${errorMessage || "Unknown error"}. Thử lại nhé! 🛠️`;
    }
}

// ===================================================================
// 🎨 HÀM TẠO LỜI CHÀO & GỢI Ý CÂU HỎI
// ===================================================================
/**
 * Tạo lời chào intro từ AI dựa trên profile người chơi
 * 
 * 📌 CHỈNH LỜI CHÀO Ở ĐÂY (dòng 198-204)
 * Bạn có thể thêm emoji, đổi nội dung, hoặc thêm thông tin khác
 */
export function getIntroMessage(
    ai: AICompanionData,
    planetName: string,
    profile?: PlanetProfile | null
): string {
    if (profile) {
        const roleInfo = ROLE_INFO[profile.role];
        // 💬 CHỈNH LỜI CHÀO CHO NGƯỜI CÓ PROFILE Ở ĐÂY
        return `Xin chào ${profile.citizenName}! 👋 Tôi là ${ai.name}. 
Rất vui được gặp một ${roleInfo.title} ${roleInfo.icon} trên ${planetName}! 
Với ${profile.quizScore}/5 điểm quiz, bạn thực sự hiểu biết về nơi này! 
Hỏi tôi bất cứ điều gì về ${planetName}! 🚀`;
    }

    // 💬 CHỈNH LỜI CHÀO CHO NGƯỜI CHƯA CÓ PROFILE Ở ĐÂY
    return `Xin chào! Tôi là ${ai.name}, AI companion của ${planetName}. 
Hỏi tôi về địa lý, khoa học, hay bất cứ điều gì về hành tinh này! 🌟`;
}

/**
 * Tạo danh sách gợi ý câu hỏi dựa trên role
 * 
 * 📌 THÊM/SỬA GỢI Ý CÂU HỎI Ở ĐÂY (dòng 218-240)
 * Mỗi role sẽ có 3 câu hỏi gợi ý khác nhau
 */
export function getSuggestedQuestions(
    planetId: string,
    role?: "scientist" | "explorer" | "engineer" | "pilot"
): string[] {
    // 💬 CHỈNH CÂU HỎI CƠ BẢN (cho tất cả role) Ở ĐÂY
    const baseSuggestions = [
        `Điều thú vị nhất về ${planetId} là gì?`,
        `Có nước trên ${planetId} không?`,
        `${planetId} khác Trái Đất như thế nào?`,
    ];

    // 💬 CHỈNH CÂU HỎI THEO TỪNG ROLE Ở ĐÂY
    const roleSuggestions: Record<string, string[]> = {
        scientist: [
            `Khí quyển của ${planetId} như thế nào?`,
            `Cấu trúc địa chất của ${planetId}?`,
            `Có dấu hiệu sự sống trên ${planetId} không?`,
        ],
        explorer: [
            `Địa điểm nào đáng khám phá nhất?`,
            `Làm sao để di chuyển trên ${planetId}?`,
            `Có gì ẩn chứa bên dưới bề mặt?`,
        ],
        engineer: [
            `Xây dựng trên ${planetId} khó như thế nào?`,
            `Cấu trúc nào lớn nhất trên ${planetId}?`,
            `Vật liệu nào có sẵn để xây dựng?`,
        ],
        pilot: [
            `Quỹ đạo của ${planetId} như thế nào?`,
            `Hạ cánh trên ${planetId} khó không?`,
            `Tốc độ thoát khỏi ${planetId} là bao nhiêu?`,
        ],
    };

    return role ? roleSuggestions[role] : baseSuggestions;
}
