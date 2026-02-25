interface UserAvatarProps {
  name: string;
  picture?: string | null;
  size?: number;
}

export default function UserAvatar({ name, picture, size = 40 }: UserAvatarProps) {
  const initial = name?.charAt(0).toUpperCase() || "?";

  if (picture) {
    return (
      <img
        src={picture}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: "#ccc", // sivi krug
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        color: "#fff",
        fontSize: size / 2,
        textTransform: "uppercase",
      }}
    >
      {initial}
    </div>
  );
}
