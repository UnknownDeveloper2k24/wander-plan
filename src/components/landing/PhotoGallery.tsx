import travelBeach from "@/assets/travel-beach.jpg";
import travelHiker from "@/assets/travel-hiker.jpg";
import travelBoat from "@/assets/travel-boat.jpg";
import travelKayak from "@/assets/travel-kayak.jpg";
import travelSummit from "@/assets/travel-summit.jpg";
import travelOcean from "@/assets/travel-ocean.jpg";

const photos = [
  { src: travelBeach, alt: "Beach paradise", tall: true },
  { src: travelHiker, alt: "Mountain hiking", tall: false },
  { src: travelBoat, alt: "River boat journey", tall: true },
  { src: travelKayak, alt: "Kayaking adventure", tall: true },
  { src: travelSummit, alt: "Summit celebration", tall: false },
  { src: travelOcean, alt: "Ocean seabirds", tall: true },
];

export default function PhotoGallery() {
  return (
    <section className="py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-4 items-end justify-center">
          {photos.map((photo, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden flex-shrink-0"
              style={{
                width: i === 3 ? "200px" : i === 0 ? "160px" : "140px",
                height: photo.tall ? (i === 3 ? "280px" : "240px") : "180px",
              }}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
