import travelBeach from "@/assets/travel-beach.jpg";
import travelHiker from "@/assets/travel-hiker.jpg";
import travelBoat from "@/assets/travel-boat.jpg";
import travelKayak from "@/assets/travel-kayak.jpg";
import travelSummit from "@/assets/travel-summit.jpg";
import travelOcean from "@/assets/travel-ocean.jpg";

const photos = [
  { src: travelBeach, alt: "Beach paradise" },
  { src: travelHiker, alt: "Mountain hiking" },
  { src: travelBoat, alt: "River boat journey" },
  { src: travelKayak, alt: "Kayaking adventure" },
  { src: travelSummit, alt: "Summit celebration" },
  { src: travelOcean, alt: "Ocean seabirds" },
];

export default function PhotoGallery() {
  return (
    <section className="py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {photos.map((photo, i) => (
            <div
              key={i}
              className={`rounded-2xl overflow-hidden ${
                i % 3 === 0 ? "row-span-1 aspect-[3/4]" :
                i % 3 === 1 ? "row-span-1 aspect-[3/4]" :
                "row-span-1 aspect-[3/4]"
              }`}
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
