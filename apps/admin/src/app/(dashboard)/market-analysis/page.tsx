import MarketRecommendations from "@/components/MarketRecommendations";

const MarketAnalysisPage = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">Phân tích thị trường & gợi ý nhập hàng</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Gợi ý kết hợp dữ liệu bán hàng nội bộ với tín hiệu nhu cầu thị trường theo danh mục để đề xuất sản phẩm nên nhập.
        </p>
      </div>
      <MarketRecommendations />
    </div>
  );
};

export default MarketAnalysisPage;
