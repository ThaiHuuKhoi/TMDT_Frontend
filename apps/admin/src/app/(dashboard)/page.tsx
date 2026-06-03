import DashboardOverview from "@/components/DashboardOverview";

const Homepage = () => {
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h1>
        <p className="mt-1 text-sm text-gray-500">
          Doanh thu, đơn hàng và sản phẩm bán chạy theo dữ liệu thật từ backend.
        </p>
      </div>

      <DashboardOverview />
    </div>
  );
};

export default Homepage;
