import BackToTop from "@/components/BackToTop";
import { Carousel } from "@/components/Carousel";
import { Categories } from "@/components/Categories";
import { Courses } from "@/components/Courses";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import Services from "@/components/Services";
import { Spinner } from "@/components/Spinner";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role) {
    const role = session.user.role.toLowerCase();
    redirect(`/${role}`);
  }

  return (
    <div>
      <Spinner />
      <Carousel />

      <BackToTop />
    </div>
  );
}
