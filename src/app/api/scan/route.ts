import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    
    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Convert image to base64
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const mediaType = image.type === "image/png" ? "png" : "jpeg";
    const dataUrl = `data:image/${mediaType};base64,${base64}`;

    // Call Anthropic Claude Haiku API
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Anthropic API key not configured" }, { status: 500 });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-0.2.5",
        max_tokens: 200,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Extract oven cooking settings from this recipe image. Return ONLY valid JSON with these fields:
- ovenType: "fan" if fan/convection/air fryer mentioned, "conventional" otherwise
- temperature: temperature in Celsius (number), or null if not found
- time: cooking time in minutes (number), or null if not found
- confidence: confidence score 0-1

Example: {"ovenType":"fan","temperature":180,"time":25,"confidence":0.9}

Respond with ONLY the JSON, no other text.`,
              },
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: image.type === "image/png" ? "image/png" : "image/jpeg",
                  data: base64,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: `Anthropic API error: ${error}` }, { status: 500 });
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    // Parse the JSON response
    let result;
    try {
      result = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Scan API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
