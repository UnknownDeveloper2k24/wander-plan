const logos = [
  "Lonely Planet", "TripAdvisor", "Airbnb", "MakeMyTrip",
  "Goibibo", "Cleartrip", "Booking.com", "Yatra",
];

export default function LogoBar() {
  return (
    <section className="py-8 border-y border-border overflow-hidden">
      <div className="flex animate-scroll-x gap-16 items-center whitespace-nowrap">
        {[...logos, ...logos].map((name, i) => (
          <span
            key={i}
            className="text-muted-foreground/40 text-lg font-bold tracking-wide select-none flex-shrink-0"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}
