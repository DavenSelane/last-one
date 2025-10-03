import Image from "next/image";

interface UserCardProps {
  type: string;
  count?: number;
  trend?: string;
  loading?: boolean;
}

const UserCard = ({ type, count = 0, trend = "2024/25", loading = false }: UserCardProps) => {
  return (
    <div className="rounded-2xl odd:bg-lamaPurple even:bg-lamaYellow p-4 flex-1 min-w-[130px]">
      <div className="flex justify-between items-center">
        <span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-600">
          {trend}
        </span>
        <Image src="/more.png" alt="" width={20} height={20} />
      </div>
      <h1 className="text-2xl font-semibold my-4">
        {loading ? "..." : count.toLocaleString()}
      </h1>
      <h2 className="capitalize text-sm font-medium text-gray-500">{type}</h2>
    </div>
  );
};

export default UserCard;
