import type { Metadata } from "next";
import ProfilePage from '@/features/auth/components/ProfilePage';

export const metadata: Metadata = {
  title: "Tài khoản của tôi",
  robots: { index: false, follow: false },
};

export default function ProfileRoute() {
    return <ProfilePage />;
}