interface UserAvatarProps {
  name: string;
  picture?: string | null;
  size?: number;
}

function fixImageUrl(url?: string | null) {
  if (!url) return null;

  // ako je već apsolutni URL
  if (url.startsWith("http")) {
    return url.replace("/web/web/", "/web/");
  }

  const base = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || "";
  return `${base}${url}`.replace("/web/web/", "/web/");
}

export default function UserAvatar({
  name,
  picture,
  size = 40,
}: UserAvatarProps) {
  const initial = name?.charAt(0).toUpperCase() || "?";

  const src = fixImageUrl(picture);

  if (src) {
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
        backgroundColor: "#ccc",
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
