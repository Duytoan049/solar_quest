import { Info, X, Target, Zap, Shield, Eye } from "lucide-react";

interface GameMechanicsInfoProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GameMechanicsInfo({ isOpen, onClose }: GameMechanicsInfoProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Info className="w-6 h-6 text-blue-400" />
            Cơ chế Game & Hướng dẫn
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Cơ chế thua game */}
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Tại sao bạn thua game?
            </h3>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <strong>Thiên thạch chạm vào phi thuyền:</strong> Mỗi lần va chạm sẽ mất 1 mạng
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <strong>Thiên thạch rơi xuống đáy màn hình:</strong> Không mất mạng, chỉ bị xóa khỏi game
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <strong>Hết 3 mạng:</strong> Game Over! Bạn phải bắt đầu lại
                </div>
              </div>
            </div>
          </div>

          {/* Cách chơi */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Cách chơi
            </h3>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded text-center text-xs leading-6">1</div>
                <div><strong>Di chuyển:</strong> Di chuyển chuột để điều khiển phi thuyền</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded text-center text-xs leading-6">2</div>
                <div><strong>Bắn:</strong> Click chuột hoặc nhấn Space để bắn đạn</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded text-center text-xs leading-6">3</div>
                <div><strong>Mục tiêu:</strong> Bắn hạ tất cả thiên thạch để qua wave tiếp theo</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded text-center text-xs leading-6">4</div>
                <div><strong>Tạm dừng:</strong> Nhấn P để tạm dừng/tiếp tục game</div>
              </div>
            </div>
          </div>

          {/* Hiệu ứng đặc biệt */}
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
            <h3 className="text-lg font-bold text-purple-400 mb-3 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Hiệu ứng đặc biệt theo hành tinh (CÓ ẢNH HƯỞNG GAMEPLAY!)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div className="bg-yellow-900/20 p-3 rounded border border-yellow-500/20">
                  <div className="text-yellow-400 font-semibold mb-1">🌡️ Sao Thủy - Sóng Nhiệt</div>
                  <div className="text-gray-300 text-xs mb-1">Visual: Vòng xoáy nhiệt với gradient radial</div>
                  <div className="text-orange-300 text-xs">⚠️ Ảnh hưởng: Đạn bị chậm lại 20%, tầm nhìn giảm</div>
                </div>
                
                <div className="bg-pink-900/20 p-3 rounded border border-pink-500/20">
                  <div className="text-pink-400 font-semibold mb-1">☄️ Sao Kim - Mưa Axit</div>
                  <div className="text-gray-300 text-xs mb-1">Visual: 60 giọt axit rơi với splash effect</div>
                  <div className="text-orange-300 text-xs">⚠️ Ảnh hưởng: Tầm nhìn rất hạn chế (40%), radar bắt buộc</div>
                </div>
                
                <div className="bg-blue-900/20 p-3 rounded border border-blue-500/20">
                  <div className="text-blue-400 font-semibold mb-1">🌍 Trái Đất - Không có</div>
                  <div className="text-gray-300 text-xs mb-1">Visual: Chỉ atmospheric glow nhẹ</div>
                  <div className="text-green-300 text-xs">✅ Ảnh hưởng: Không có - Level dễ nhất</div>
                </div>
                
                <div className="bg-red-900/20 p-3 rounded border border-red-500/20">
                  <div className="text-red-400 font-semibold mb-1">🔴 Sao Hỏa - Bão Cát Xoáy</div>
                  <div className="text-gray-300 text-xs mb-1">Visual: 50 hạt bụi xoáy tròn với glow</div>
                  <div className="text-orange-300 text-xs">⚠️ Ảnh hưởng: Tầm nhìn giảm 60%, cần dùng radar</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-orange-900/20 p-3 rounded border border-orange-500/20">
                  <div className="text-orange-400 font-semibold mb-1">🪐 Sao Mộc - Lực Hấp Dẫn</div>
                  <div className="text-gray-300 text-xs mb-1">Visual: Xoáy gravity spiral với 40 particles</div>
                  <div className="text-orange-300 text-xs">⚠️ Ảnh hưởng: Thiên thạch di chuyển cong, khó dự đoán</div>
                </div>
                
                <div className="bg-yellow-900/20 p-3 rounded border border-yellow-500/20">
                  <div className="text-yellow-300 font-semibold mb-1">💍 Sao Thổ - Vành Đai Dày Đặc</div>
                  <div className="text-gray-300 text-xs mb-1">Visual: 240 particles vàng chảy 3 lớp</div>
                  <div className="text-orange-300 text-xs">⚠️ Ảnh hưởng: Một số đạn có thể bị chặn bởi particles</div>
                </div>
                
                <div className="bg-cyan-900/20 p-3 rounded border border-cyan-500/20">
                  <div className="text-cyan-400 font-semibold mb-1">❄️ Sao Thiên Vương - Bão Băng</div>
                  <div className="text-gray-300 text-xs mb-1">Visual: 50 ice crystals 6 cạnh xoay với glow</div>
                  <div className="text-orange-300 text-xs">⚠️ Ảnh hưởng: Phi thuyền chậm lại 30%</div>
                </div>
                
                <div className="bg-indigo-900/20 p-3 rounded border border-indigo-500/20">
                  <div className="text-indigo-400 font-semibold mb-1">🌊 Sao Hải Vương - Năng Lượng Sâu</div>
                  <div className="text-gray-300 text-xs mb-1">Visual: 4 energy orbs + tendrils gradient</div>
                  <div className="text-orange-300 text-xs">⚠️ Ảnh hưởng: Tầm nhìn 30%, thiên thạch cực lớn</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-purple-950/40 rounded border border-purple-500/20">
              <div className="text-purple-300 font-semibold mb-2">💡 Lưu ý quan trọng:</div>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• Hiệu ứng xuất hiện sau 300 frames, kéo dài 200 frames</li>
                <li>• Mỗi hiệu ứng làm thay đổi cách chơi - không chỉ là visual!</li>
                <li>• Radar tự động bật khi có hiệu ứng làm giảm tầm nhìn</li>
                <li>• Học cách thích nghi với từng hiệu ứng để chơi tốt hơn</li>
              </ul>
            </div>
          </div>

          {/* Mẹo chơi */}
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Mẹo chơi hiệu quả
            </h3>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div><strong>Ưu tiên thiên thạch lớn:</strong> Chúng di chuyển chậm hơn nhưng gây nhiều damage</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div><strong>Di chuyển linh hoạt:</strong> Có thể để thiên thạch rơi xuống đáy mà không mất mạng</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div><strong>Bắn liên tục:</strong> Giữ chuột hoặc Space để bắn liên tục</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div><strong>Quan sát radar:</strong> Khi có hiệu ứng đặc biệt, radar sẽ giúp bạn định vị thiên thạch</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div><strong>Học từng hành tinh:</strong> Mỗi hành tinh có pattern khác nhau, hãy làm quen với chúng</div>
              </div>
            </div>
          </div>

          {/* Hệ thống điểm */}
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
            <h3 className="text-lg font-bold text-yellow-400 mb-3">💎 Hệ thống điểm số</h3>
            <div className="space-y-2 text-gray-300">
              <div>• <strong>Điểm cơ bản:</strong> Mỗi thiên thạch có điểm khác nhau tùy hành tinh</div>
              <div>• <strong>Bonus multiplier:</strong> Một số hành tinh có hệ số nhân điểm</div>
              <div>• <strong>Wave bonus:</strong> Qua wave càng cao, điểm càng nhiều</div>
              <div>• <strong>Combo:</strong> Bắn liên tục không bị miss sẽ có bonus</div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Đã hiểu!
          </button>
        </div>
      </div>
    </div>
  );
}
