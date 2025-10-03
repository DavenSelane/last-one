import { Navbar } from "@/components/Navbar";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export default async function Page() {
  const session = await getServerSession(authOptions);
  const userole = session?.user?.role;
  const username = session?.user?.name;
  const name = userole?.toLowerCase();

  return (
    <div>
      <div className="container-fluid bg-primary py-5 mb-5 page-header">
        <div className="container py-5">
          <h1 className="display-3 text-white animated slideInDown">
            {" "}
            Welcome ,{username}
          </h1>
          <p className="text-white mb-0">Isinamuva {name} monitoring space</p>
        </div>
      </div>
    </div>
  );
}
