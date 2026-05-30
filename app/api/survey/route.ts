import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      respondent,
      q1,
      q1_other,
      q2,
      q3_selected,
      q3_other,
      q3_top3,
      q4,
      q5,
      q6_likert,
      q6_open,
      q6_approaches,
      q6_approaches_other,
      q7,
      q8,
      q9,
      q10,
      email,
      additional_message,
    } = body;

    // Basic validation — respondent is required
    if (!respondent) {
      return NextResponse.json(
        { error: "Respondent field is required." },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("survey_responses").insert([
      {
        respondent,
        q1,
        q1_other,
        q2,
        q3_selected,
        q3_other,
        q3_top3,
        q4,
        q5,
        q6_likert,
        q6_open,
        q6_approaches: q6_approaches || null,
        q6_approaches_other: q6_approaches_other || null,
        q7,
        q8,
        q9,
        q10,
        email: email || null,
        additional_message: additional_message || null,
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to save survey response." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("API /survey error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
