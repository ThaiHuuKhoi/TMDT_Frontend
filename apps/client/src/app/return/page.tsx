import { redirect } from "next/navigation";

/** Giữ URL cũ: chuyển hướng sang trang giải thích /payment/return */
export default function LegacyReturnPage() {
  redirect("/payment/return");
}
