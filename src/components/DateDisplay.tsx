"use client";

export default function DateDisplay() {
  const today = new Date();
  const formatted = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return <p className="text-gray-500">{formatted}</p>;
}
