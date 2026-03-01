import Image from "next/image";
import Link from "next/link";

export interface Obavestenja {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  image: string;
  slug: string;
}

export default function ObavestenjaCard({ item }: { item: Obavestenja }) {
  return (
    <div className="obav-card">
      <div className="obav-image">
        <Image
          src={item.image}
          alt={item.title}
          width={320}
          height={200}
          className="img"
        />
      </div>

      <div className="obav-content">
        <h3>{item.title}</h3>
        <div className="obav-date">{item.date}</div>
        <p>{item.excerpt}</p>

        <Link href={`/obavestenja/${item.slug}`} className="read-more">
          Read more →
        </Link>
      </div>
    </div>
  );
}
