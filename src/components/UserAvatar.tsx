interface UserAvatarProps {
  name: string;
  picture?: string | null;
  size?: number;
}

function fixImageUrl(url?: string | null) {
  if (!url) return null;

  if (url.startsWith("http")) {
    return url.replace("/web/web/", "/web/");
  }

  const base = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || "";
  return `${base}${url}`.replace("/web/web/", "/web/");
}

const getInitials = (name?: string) => {
  if (!name) return "?";

  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();

  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const getColorFromName = (name: string) => {
  const colors = [
    "#1abc9c",
    "#3498db",
    "#9b59b6",
    "#e67e22",
    "#e74c3c",
    "#2ecc71",
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

export default function UserAvatar({
  name,
  picture,
  size = 40,
}: UserAvatarProps) {
  const src = fixImageUrl(picture);
  const initials = getInitials(name);
  const bgColor = getColorFromName(name || "user");

  if (src && src !== "undefined" && src !== "null") {
    return (
      <img
        src={src}
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
        backgroundColor: bgColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        color: "#fff",
        fontSize: size / 2.5,
      }}
    >
      {initials}
    </div>
  );
}
