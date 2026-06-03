import FacebookPosts from "@/components/FacebookPosts";

const FacebookPostsPage = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">Đăng bài Facebook</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Soạn nội dung quảng cáo và đăng trực tiếp lên Facebook Page qua Meta Graph API.
        </p>
      </div>
      <FacebookPosts />
    </div>
  );
};

export default FacebookPostsPage;
