export async function startInterviewWithIntro(interviewOutline: string) {
  if (!interviewOutline) {
    throw new Error("Interview outline (text) is missing.");
  }
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/start-interview`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: interviewOutline,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to start the interview");
    }

    const result = await response.json();

    return result;
  } catch (error) {
    console.error("Error generating interview:", error);
    throw error;
  }
}
