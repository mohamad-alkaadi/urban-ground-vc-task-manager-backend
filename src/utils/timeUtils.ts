// This utility function is used to get the current time in Berlin, which is important for providing context to the Gemini model when it generates responses.
export const getBerlinTime = (now: Date) => {
  return now.toLocaleString("en-DE", {
    timeZone: "Europe/Berlin",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
