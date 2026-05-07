import Image from "next/image";

const photos = [
  { src: "/photos/box-opened.jpg", alt: "An open Uncle May's box with kale, sweet potatoes, carrots, and Doudlah Farms cheese", w: 4, h: 3 },
  { src: "/photos/collards-armful.jpg", alt: "Armful of fresh collard greens from a Black farmer", w: 3, h: 4 },
  { src: "/photos/heritage-turkey.jpg", alt: "USDA-inspected pasture-raised turkey, vacuum-sealed", w: 4, h: 3 },
  { src: "/photos/microgreens.jpg", alt: "Speckled pea microgreens from The Fresh Patch, harvested 4/27", w: 4, h: 3 },
  { src: "/photos/sweet-potatoes.jpg", alt: "Four large fresh sweet potatoes", w: 3, h: 4 },
  { src: "/photos/potatoes.jpg", alt: "Cluster of fresh-dug Yukon potatoes", w: 4, h: 3 },
  { src: "/photos/daikon.jpg", alt: "Three white daikon radishes with greens still attached", w: 4, h: 3 },
  { src: "/photos/produce-box.jpg", alt: "A single Uncle May's Fresh Produce box ready for delivery", w: 4, h: 3 },
  { src: "/photos/market-table.jpg", alt: "Three Uncle May's produce boxes on a covered market table", w: 4, h: 3 },
];

export function RealBoxGallery({
  title = "What actually arrives at your door",
  subtitle = "Real photos from recent Uncle May's boxes. No stock images, no studio lighting.",
}: { title?: string; subtitle?: string }) {
  return (
    <section className="py-12 bg-background">
      <div className="container px-6 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          <p className="mt-2 text-foreground/70">{subtitle}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {photos.map((p, i) => (
            <div
              key={p.src}
              className={`relative overflow-hidden rounded-xl border border-border/50 shadow-soft bg-muted ${
                i === 0 ? "col-span-2 row-span-2 aspect-square md:aspect-[4/3]" : "aspect-square"
              }`}
            >
              <Image
                src={p.src}
                alt={p.alt}
                fill
                sizes="(min-width: 768px) 33vw, 50vw"
                className="object-cover hover:scale-105 transition-transform duration-500"
                loading={i < 3 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
