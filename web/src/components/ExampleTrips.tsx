import React from "react";
import { Link } from "react-router-dom";

const TRIPS = [
  {
    id: "rome-food",
    title: "Rome + Florence Food Tour",
    emoji: "🍝",
    days: 5,
    blurb:
      "Pasta class, hidden trattorie, and sunrise at the Trevi Fountain — planned for you.",
    to: "/app?demo=rome",
    image:
      "https://images.unsplash.com/photo-1506806732259-39c2d0268443?q=80&w=1200&auto=format&fit=crop",
    testimonial: {
      name: "Sam R.",
      quote: "The AI nailed our vibe. We saved hours and ate like locals!",
    },
  },
  {
    id: "bali-relax",
    title: "Bali Beaches & Temples",
    emoji: "🌴",
    days: 6,
    blurb:
      "Sunrise at Lempuyang, Ubud swings, and a spa day on Nusa Dua — all in one flow.",
    to: "/app?demo=bali",
    image:
      "https://images.unsplash.com/photo-1543248939-ff40856f65d1?q=80&w=1200&auto=format&fit=crop",
    testimonial: {
      name: "Ayesha K.",
      quote: "Perfect balance of chill and adventure. 10/10 would book again.",
    },
  },
  {
    id: "tokyo-weekender",
    title: "Tokyo Weekender",
    emoji: "🗼",
    days: 3,
    blurb:
      "Tsukiji sushi, Akihabara arcades, and a day trip to Hakone with onsen views.",
    to: "/app?demo=tokyo",
    image:
      "https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=1200&auto=format&fit=crop",
    testimonial: {
      name: "Marcus L.",
      quote: "Felt like a local. The schedule was smart and realistic.",
    },
  },
];

export default function ExampleTrips() {
  return (
    <section className="section">
      <div className="space-between">
        <h2>Discover Example Trips</h2>
        <Link className="btn ghost" to="/app">
          Open Planner
        </Link>
      </div>

      <div
        className="trip-cards mt-3"
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
        }}
      >
        {TRIPS.map((t) => (
          <Link key={t.id} to={t.to} className="trip-card">
            <article className="card hover-lift" style={{ overflow: "hidden" }}>
              <div
                style={{
                  height: 176,
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.1), rgba(0,0,0,.55)), url(${t.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  position: "relative",
                }}
              >
                <div
                  className="badge"
                  style={{ position: "absolute", right: 12, top: 12 }}
                >
                  {t.days} days
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: 12,
                    bottom: 12,
                    background: "rgba(0,0,0,.45)",
                    padding: "4px 8px",
                    borderRadius: 8,
                    color: "#fff",
                  }}
                >
                  {t.emoji}{" "}
                  <span style={{ opacity: 0.95, marginLeft: 6 }}>{t.title}</span>
                </div>
              </div>

              <div className="p-3">
                <p className="sub">{t.blurb}</p>
                <div
                  className="mt-2 card"
                  style={{ background: "rgba(255,255,255,.04)" }}
                >
                  <p className="sub" style={{ fontSize: 12 }}>
                    "{t.testimonial.quote}"
                  </p>
                  <p style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
                    — {t.testimonial.name}
                  </p>
                </div>

                <div className="space-between mt-2">
                  <span className="sub">Tap to preview in planner</span>
                  <span className="link">View</span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
