import Link from "next/link";

export default function ObavestenjaCard({ item, included }: any) {
  const { title, body, created, path } = item.attributes;

  const imageRel = item.relationships?.field_image?.data;
  const image = imageRel
    ? included?.find((i: any) => i.id === imageRel.id)
    : null;

  const imageUrl = image?.attributes?.uri?.url
    ? `${process.env.DRUPAL_BASE_URL}${image.attributes.uri.url}`
    : "/placeholder.jpg";

  return (
    <article className="card mb-4 shadow-sm border-0">
      <div className="row g-0 align-items-stretch">
        {/* Slika */}
        <div className="col-md-4">
          <img
            src={imageUrl}
            alt={title}
            className="img-fluid h-100 w-100 object-fit-cover rounded-start"
          />
        </div>

        {/* Tekst */}
        <div className="col-md-8">
          <div className="card-body d-flex flex-column h-100">
            <h5 className="card-title mb-1">{title}</h5>

            <small className="text-muted mb-2">
              {new Date(created).toLocaleDateString("sr-RS")}
            </small>

            <p className="card-text flex-grow-1">
              {body?.summary ??
                body?.value
                  ?.replace(/<[^>]+>/g, "")
                  .slice(0, 140) + "…"}
            </p>

            <Link
              href={path.alias}
              className="fw-semibold text-decoration-none mt-auto"
            >
              Read more →
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
