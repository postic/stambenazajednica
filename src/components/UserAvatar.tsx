"use client";

type UserAvatarProps = {
  name?: string;
  picture?: string;
  size?: number;
};

export default function UserAvatar({ name, picture, size = 40 }: UserAvatarProps) {
  if (!picture) {
    const initials = name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?";
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center rounded-full bg-gray-500 text-white font-semibold text-sm"
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full overflow-hidden"
    >
      <img
        src={picture}
        alt={name ?? "Avatar"}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
